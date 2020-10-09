import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as orgActions from '../../../../../../actions/org';
import * as baseActions from '../../../../../../actions/base';

import './stylesheet.css';

import _ from 'lodash';

import HeaderActionDrawer from '../HeaderActionDrawer';

import { indexOfHeaderWithId } from '../../../../../../lib/org_utils';
import { getCurrentTimestamp } from '../../../../../../lib/timestamps';

class StaticHeaderActionDrawer extends PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'handleEnterTitleEditMode',
      'handleEnterDescriptionEditMode',
      'handleShowTagsModal',
      'handleShowPropertyListEditorModal',
      'handleFocus',
      'handleUnfocus',
      'handleAddNewHeader',
      'handleDeadlineClick',
      'handleClockInOutClick',
      'handleScheduledClick',
      'handleShareHeaderClick',
      'handleRefileHeaderRequest',
      'handleAddNoteClick',
    ]);
  }

  handleEnterTitleEditMode() {
    this.props.org.enterEditMode('title');
  }

  handleEnterDescriptionEditMode() {
    this.props.org.openHeader(this.props.selectedHeaderId);
    this.props.org.enterEditMode('description');
  }

  handleShowTagsModal() {
    this.props.base.activatePopup('tags-editor');
  }

  handleShowPropertyListEditorModal() {
    this.props.base.activatePopup('property-list-editor');
  }

  handleFocus() {
    this.props.org.focusHeader(this.props.selectedHeaderId);
  }

  handleUnfocus() {
    this.props.org.unfocusHeader();
  }

  handleAddNewHeader() {
    this.props.org.addHeaderAndEdit(this.props.header.get('id'));
  }

  handleDeadlineAndScheduledClick(planningType) {
    const { header, selectedHeaderId } = this.props;

    const existingDeadlinePlanningItemIndex = header
      .get('planningItems', [])
      .findIndex((planningItem) => planningItem.get('type') === planningType);

    if (existingDeadlinePlanningItemIndex === -1) {
      this.props.org.addNewPlanningItem(selectedHeaderId, planningType);
      this.props.base.activatePopup('timestamp-editor', {
        headerId: selectedHeaderId,
        planningItemIndex: header.get('planningItems').size,
      });
    } else {
      this.props.base.activatePopup('timestamp-editor', {
        headerId: header.get('id'),
        planningItemIndex: existingDeadlinePlanningItemIndex,
      });
    }

    this.props.org.openHeader(selectedHeaderId);
  }

  handleDeadlineClick() {
    this.handleDeadlineAndScheduledClick('DEADLINE');
  }

  handleClockInOutClick() {
    const { header, selectedHeaderId } = this.props;
    const logBook = header.get('logBookEntries', []);
    const existingClockIndex = logBook.findIndex((entry) => entry.get('end') === null);
    const now = getCurrentTimestamp({ isActive: false, withStartTime: true });
    if (existingClockIndex !== -1) {
      this.props.org.setLogEntryStop(
        selectedHeaderId,
        logBook.getIn([existingClockIndex, 'id']),
        now
      );
    } else {
      this.props.org.createLogEntryStart(selectedHeaderId, now);
    }
  }

  handleScheduledClick() {
    this.handleDeadlineAndScheduledClick('SCHEDULED');
  }

  handleShareHeaderClick() {
    const { header } = this.props;
    const titleLine = header.get('titleLine');
    const todoKeyword = titleLine.get('todoKeyword');
    const tags = titleLine.get('tags');
    const title = titleLine.get('rawTitle').trim();
    const subject = todoKeyword ? `${todoKeyword} ${title}` : title;
    const body = `
${tags.isEmpty() ? '' : `Tags: ${tags.join(' ')}\n`}
${header.get('rawDescription')}`;
    //const titleParts = titleLine.get('title'); // List of parsed tokens in title
    //const properties = header.get('propertyListItem'); //.get(0) .get('property') or .get('value')
    //const planningItems = header.get('planningItems'); //.get(0) .get('type') [DEADLINE|SCHEDULED] or .get('timestamp')
    const mailtoURI = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body
    )}`;
    // TODO: If available, use webshare
    // Maybe there's synergy with this PR: https://github.com/200ok-ch/organice/pull/138/files

    window.open(mailtoURI);
    // INFO: Alternative implementation that works without having a
    // popup window. We didn't go this route, because it's non-trivial
    // to mock the window object, so it's harder to test. Having
    // slightly worse UX in favor of having a test is not optimal, as
    // well, of course.
    // window.location.href = mailtoURI;
  }

  handleRefileHeaderRequest() {
    this.props.base.activatePopup('refile');
  }

  handleAddNoteClick() {
    let input = prompt('Enter a note to add to the header:');
    if (input !== null) input = input.trim();
    if (!input) return;

    this.props.org.addNote(input, new Date());
  }

  noop(){}

  render(){
    const {
      selectedHeaderId,
      focusedHeaderId,
      header,
    } = this.props;

    if(!header){
      return (
        <div className='static-action-bar'>
          <HeaderActionDrawer
                disabled={true}
                onEnterTitleEditMode={this.noop}
                onEnterDescriptionEditMode={this.noop}
                isFocused={false}
                onTagsClick={this.noop}
                onPropertiesClick={this.noop}
                onFocus={this.noop}
                onUnfocus={this.noop}
                onAddNewHeader={this.noop}
                onDeadlineClick={this.noop}
                onClockInOutClick={this.noop}
                onScheduledClick={this.noop}
                hasActiveClock={false}
                onShareHeader={this.noop}
                onRefileHeader={this.noop}
                onAddNote={this.noop}
              />
        </div>
        );
    }
    this.props.org.selectHeader(header.get('id'))

    const isFocused = focusedHeaderId===selectedHeaderId;
    
    const logBookEntries = (header && header.get('logBookEntries')) ?
      header
      .get('logBookEntries')
      .filter((entry) => entry.get('raw') === undefined) :
      null;
    const hasActiveClock = logBookEntries ? 
      logBookEntries.size !== 0 && logBookEntries.filter((entry) => !entry.get('end')).size !== 0 :
      null;
      

    return (
      <div className='static-action-bar'>
        <HeaderActionDrawer
            onEnterTitleEditMode={this.handleEnterTitleEditMode}
            onEnterDescriptionEditMode={this.handleEnterDescriptionEditMode}
            isFocused={isFocused}
            onTagsClick={this.handleShowTagsModal}
            onPropertiesClick={this.handleShowPropertyListEditorModal}
            onFocus={this.handleFocus}
            onUnfocus={this.handleUnfocus}
            onAddNewHeader={this.handleAddNewHeader}
            onDeadlineClick={this.handleDeadlineClick}
            onClockInOutClick={this.handleClockInOutClick}
            onScheduledClick={this.handleScheduledClick}
            hasActiveClock={hasActiveClock}
            onShareHeader={this.handleShareHeaderClick}
            onRefileHeader={this.handleRefileHeaderRequest}
            onAddNote={this.handleAddNoteClick}
          />
      </div>);
  }
}

const getSelectedHeader = (state) => {
  const headerId = state.org.present.get('selectedHeaderId');
  const headers = state.org.present.get('headers');
  if(!headers){
    return null;
  }
  const headerIdx = indexOfHeaderWithId(headers, headerId);
  if(headerIdx===-1){
    return null; 
   }
  return state.org.present.getIn(['headers', headerIdx]);
};

const mapStateToProps = (state) => {
  return {
    selectedHeaderId: state.org.present.get('selectedHeaderId'),
    focusedHeaderId: state.org.present.get('focusedHeaderId'),
    header: getSelectedHeader(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    org: bindActionCreators(orgActions, dispatch),
    base: bindActionCreators(baseActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StaticHeaderActionDrawer);