/* global process */

import { OAuth2AuthCodePKCE } from '@bity/oauth2-auth-code-pkce';
import { orgFileExtensions } from '../lib/org_utils';
import { getPersistedField } from '../util/settings_persister';

import { fromJS, Map } from 'immutable';

export const createForgejoOAuth = () => {
  // Use promises as mutex to prevent concurrent token refresh attempts, which causes problems.
  // More info: https://github.com/BitySA/oauth2-auth-code-pkce/issues/29
  // TODO: remove this workaround if/when oauth2-auth-code-pkce fixes the issue.
  let expiryPromise;
  let invalidGrantPromise;
  return new OAuth2AuthCodePKCE({
    authorizationUrl: `${getPersistedField('forgejoDomain')}/login/oauth/authorize`,
    tokenUrl: `${getPersistedField('forgejoDomain')}/login/oauth/access_token`,
    clientId: process.env.REACT_APP_FORGEJO_CLIENT_ID,
    redirectUrl: window.location.origin,
    scopes: ['api'],
    extraAuthorizationParams: {
      clientSecret: process.env.REACT_APP_FORGEJO_SECRET,
    },
    onAccessTokenExpiry: async (refreshToken) => {
      if (!expiryPromise) {
        expiryPromise = refreshToken();
      }
      const result = await expiryPromise;
      expiryPromise = undefined;
      return result;
    },
    onInvalidGrant: async (refreshAuthCodeOrToken) => {
      if (!invalidGrantPromise) {
        invalidGrantPromise = refreshAuthCodeOrToken();
      }
      // This is a void promise, so don't need to return the result. Refer to the TypeScript source
      // of OAuth2AuthCodePKCE. Types are great.
      await invalidGrantPromise;
      invalidGrantPromise = undefined;
    },
  });
};

export const forgejoRepositoryFromURL = (url) => {
  const regex = /(?<domain>.+)\/(?<owner>[^\/]+)\/(?<repository>[^\/]+)$/;
  const match = url.match(regex);
  if (match) {
    return match.groups;
  }
};

export const contentsResponseToDirectoryListing = (contents) => {
  const isDirectory = (it) => it.type === 'dir';
  return fromJS(
    contents
      .filter((it) => isDirectory(it) || it.name.match(orgFileExtensions))
      .map((it) => ({
        id: it.sha,
        name: it.name,
        // Organice requires a leading "/", whereas Forgejo API doesn't
        // use one.
        path: `/${it.path}`,
        isDirectory: isDirectory(it),
      }))
      .sort((a, b) => {
        // Folders first.
        if (a.isDirectory && !b.isDirectory) {
          return -1;
        } else if (!a.isDirectory && b.isDirectory) {
          return 1;
        } else {
          // Can't have same name, so don't need to check if
          // equal/return 0.
          return a.name > b.name ? 1 : -1;
        }
      })
  );
};

/**
 * Forgejo sync backend, implemented using their REST API.
 *
 * @see https://forgejo.org/docs/latest/user/api/usage/
 * @param {OAuth2AuthCodePKCE} oauthClient
 */
export default (oauthClient) => {
  const decoratedFetch = oauthClient.decorateFetchHTTPClient(fetch);

  const getRepositoryApi = () =>
    `${getPersistedField('forgejoDomain')}/api/v1/repos/${getPersistedField(
      'forgejoOwner'
    )}/${getPersistedField('forgejoRepository')}`;

  const isSignedIn = async () => {
    if (!oauthClient.isAuthorized()) {
      return false;
    }
    // Verify that we have an OAuth token (and refresh if needed).
    // Don't care about return value, because the library handles
    // persisting for us.
    try {
      await oauthClient.getAccessToken();
      return true;
    } catch (e) {
      console.error('Error trying to get OAuth access token.');
      console.error(e);
      return false;
    }
  };

  const callContentsApi = async (path, method = 'GET', body = null) => {
    const url = `${getRepositoryApi()}/contents${path}`;
    const response = await decoratedFetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body == null ? null : JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Unexpected response from contents API. Status code: ${response.status}`);
    }
    const data = await response.json();
    return data;
  };

  const getDirectoryListing = async (path) => {
    const data = await callContentsApi(path);
    return {
      listing: contentsResponseToDirectoryListing(data),
      hasMore: false,
      additionalSyncBackendState: Map({}),
    };
  };

  const getMoreDirectoryListing = async (additionalSyncBackendState) => {
    throw Error('not implemented');
  };

  const getFileContentsAndMetadata = async (path) => {
    const file = await callContentsApi(path);
    return {
      contents: atob(file.content),
      lastModifiedAt: file.last_commit_when,
    };
  };

  const getFileContents = async (path) => atob((await getFileContentsAndMetadata(path)).contents);

  const createFile = async (path, content) => {
    await callContentsApi(path, 'POST', { content: btoa(content) });
  };

  const updateFile = async (path, content) => {
    const currentFile = await callContentsApi(path);
    await callContentsApi(path, 'PUT', {
      content: btoa(content),
      sha: currentFile.sha,
    });
  };

  const deleteFile = async (path) => {
    const currentFile = await callContentsApi(path);
    await callContentsApi(path, 'DELETE', {
      sha: currentFile.sha,
    });
  };

  return {
    type: 'Forgejo',
    isSignedIn,
    getDirectoryListing,
    getMoreDirectoryListing,
    updateFile,
    createFile,
    getFileContentsAndMetadata,
    getFileContents,
    deleteFile,
  };
};
