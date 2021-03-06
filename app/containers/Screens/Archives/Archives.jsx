import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  List,
  CollapsibleList,
  SimpleListItem,
} from '@rmwc/list';

import { generateKey } from 'utils/utils';
import { fetchBlogsList } from 'actions/Home/BlogsList/BlogsList.ax';

import '@rmwc/list/collapsible-list.css';
import './Archives.scss';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
class Archives extends Component {
  componentDidMount() {
    const { fetching, fetchData } = this.props;
    if (fetching) {
      fetchData();
    }
  }

  getMonthYear = datePublished => (
    `${monthNames[(new Date(datePublished)).getMonth()]} ${new Date(datePublished).getUTCFullYear()}`
  )

  getDate = datePublished => (
    `0${new Date(datePublished).getDate()}`.slice(-2)
  )

  getFilterData = (data) => {
    const filterMap = {};
    const sortHelper = [];
    const filterData = [];
    data.forEach((x) => {
      const monthYear = this.getMonthYear(x.date_published);
      const newData = {
        name: x.name,
        date: this.getDate(x.date_published),
        url: x.url,
      };
      if (monthYear in filterMap) {
        filterMap[monthYear].push(newData);
      } else {
        filterMap[monthYear] = [newData];
        sortHelper.push(monthYear);
      }
    });
    sortHelper.forEach((z) => {
      filterData.push({
        datePublished: z,
        dateWiseData: filterMap[z],
      });
    });
    return filterData;
  }

  render() {
    const { data } = this.props;
    const filterData = this.getFilterData(data);

    return (
      <div className="content-center-page archives-page">
        <h1 className="archives-heading">Archives</h1>
        <List>
          {
            filterData.map((x, i) => (
              <CollapsibleList
                className="collapsible"
                key={generateKey('acc-title', i)}
                handle={(
                  <SimpleListItem
                    text={`${x.datePublished} (${x.dateWiseData.length})`}
                    metaIcon="chevron_right"
                  />
                )}
                // onOpen={() => console.log('open')}
                // onClose={() => console.log('close')}
              >
                {
                  x.dateWiseData.map((y, j) => (
                    <div
                      key={generateKey('acc-body', (i * 100 + j))}
                      className="link-wrapper"
                    >
                      {`${y.date}: `}
                      <Link
                        className="link-item"
                        to={`/home/blog_page${y.url.split('.')[0]}`}
                      >
                        {y.name}
                      </Link>
                    </div>
                  ))
                }
              </CollapsibleList>
            ))
          }
        </List>
      </div>
    );
  }
}

Archives.propTypes = {
  data: PropTypes.any.isRequired,
  fetchData: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
  return {
    data: state.Home_BlogsList.data,
    fetching: state.Home_BlogsList.fetching,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: () => dispatch(fetchBlogsList()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Archives));
