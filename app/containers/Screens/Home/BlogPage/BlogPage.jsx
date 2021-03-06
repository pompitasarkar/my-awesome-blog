import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars';
import ReactMarkdown from 'react-markdown';
import { connect } from 'react-redux';
import {
  List,
  ListItem,
} from '@rmwc/list';
import { Icon } from '@rmwc/icon';
import {
  Drawer,
} from '@rmwc/drawer';
import Button from 'components/Material/Button/CustomButton';

import { URL } from 'constants/app.config';
import { generateKey } from 'utils/utils';
import { fetchBlogPost } from 'actions/Home/BlogPage/BlogPage.ax';
import { fetchBlogsList } from 'actions/Home/BlogsList/BlogsList.ax';

import './BlogPage.scss';

import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';

import { createElement } from './helper';

import 'highlight.js/styles/atom-one-dark.css';

hljs.registerLanguage('js', javascript);
hljs.registerLanguage('python', python);


class BlogPage extends Component {
  static generateRefs = (len) => {
    return Array(len).fill().map(() => React.createRef());
  }

  outlineListId = 'blog-outline'

  allRefsArr = BlogPage.generateRefs(100)

  counter = 0

  headingEls = [];

  outlineCounter = 0

  constructor(props) {
    super(props);
    const url = this.getPageUrl();
    this.state = {
      outlineDrawer: false,
      bottomOutlineDrawer: false,
      bottomRecentDrawer: false,
      url,
    };
  }

  componentDidMount() {
    const { url } = this.state;
    const { fetchData } = this.props;
    fetchData(url);
    const { listFetching, fetchListData } = this.props;
    if (listFetching) {
      fetchListData();
    }
  }

  componentDidUpdate() {
    const { fetchData } = this.props;
    const pageUrl = this.getPageUrl();
    const { url } = this.state;
    if (pageUrl !== url) {
      fetchData(pageUrl);
      this.state.url = pageUrl;
      // this.setState({ url: pageUrl });
    }
    this.hightlightCodeBlocks();
  }

  getPageUrl = () => {
    const { location: { pathname } } = this.props;
    const url = pathname.split('blog_page')[1];
    return url;
  }

  hightlightCodeBlocks = () => {
    const preTagElms = document.querySelectorAll('pre');
    const { fetching } = this.props;
    if (!fetching) {
      preTagElms.forEach((el) => {
        hljs.highlightBlock(el);
      });
      // don't delete
      // hljs.initHighlighting(); // works only for initial render
    }
  }

  renderOutline = () => {
    const self = this;
    const Comp = () => (
      self.headingEls.map((el, i) => (
        <ListItem
          key={generateKey('outline-key', i)}
          className={`outline-list-item item-level-${self.headingEls[i].level}`}
          onClick={() => {
            window.scrollTo(
              0,
              self.allRefsArr[i].current.offsetTop,
            );
          }}
        >
          {self.headingEls[i].text}
        </ListItem>
      ))
    );
    // const Comp1 = () => (
    //   <React.Fragment>
    //     <Comp />
    //     {
    //       Array(10).fill().map(j => (
    //         <ListItem
    //           key={generateKey('next-outline-key', j)}
    //           className="outline-list-item item-level-2"
    //         >
    //           Im just testing
    //         </ListItem>
    //       ))
    //     }
    //   </React.Fragment>
    // );
    setTimeout(() => {
      render(<Comp />, document.getElementById(`${self.outlineListId}-big`));
      render(<Comp />, document.getElementById(`${self.outlineListId}-small`));
    }, 300);
  }

  render() {
    const self = this;
    const {
      data, fetching,
      listData, history,
    } = this.props;
    const {
      outlineDrawer, url,
      bottomOutlineDrawer, bottomRecentDrawer,
    } = this.state;

    return (
      <Fragment>
        <div className="content-center-page blog-page">
          <div id="md-container" className="markdown-container">
            {
              (() => {
                self.counter = 0;
                self.allRefs = {};
                self.headingEls = [];
                return !fetching ? (
                  <ReactMarkdown
                    source={data}
                    escapeHtml={false}
                    linkTarget="_blank"
                    // astPlugins={[
                    //   parseHtml,
                    // ]}
                    // https://github.com/rexxars/commonmark-react-renderer/blob/master/src/commonmark-react-renderer.js
                    renderers={{
                      // assigning refs for h tags for scroll to for outline
                      heading: (props) => {
                        self.counter += 1;
                        self.headingEls.push({
                          level: props.level,
                          text: props.children[0].props.value,
                        });
                        return createElement(
                          `h${props.level}`,
                          { ref: self.allRefsArr[self.counter - 1] },
                          props.children,
                        );
                      },
                      // to render images from local folder
                      image: (props) => {
                        const splitStr = 'blog-assets';
                        const imgProps = { src: props.src, alt: props.alt };
                        if (props.src.indexOf(splitStr) > -1) {
                          imgProps.src = `${URL}/${splitStr}${props.src.split(splitStr)[1]}`;
                        }
                        return createElement(
                          'img',
                          imgProps,
                        );
                      },
                    }}
                  />
                ) : null;
              })()
            }
          </div>
          <nav className="nav-big-outline">
            <Button
              icon="vertical_split"
              className="show-outline"
              onClick={() => this.setState({ outlineDrawer: true })}
            >
              Show Outline
            </Button>
            <Drawer dismissible open={outlineDrawer}>
              <div className="nav-big-outline__heading">
                <div className="nav-big-outline__heading-text"><span>Outline</span></div>
                <div className="nav-big-outline__heading-icon">
                  <Icon
                    icon="clear"
                    iconOptions={{ strategy: 'ligature' }}
                    onClick={() => this.setState({ outlineDrawer: false })}
                  />
                </div>
              </div>
              <Scrollbars
                autoHide
                autoHideTimeout={1000}
                autoHideDuration={200}
              >
                <List
                  id={`${self.outlineListId}-big`}
                >
                  {
                    (() => {
                      self.renderOutline();
                    })()
                  }
                </List>
              </Scrollbars>
            </Drawer>
          </nav>
          <nav className="nav-big-blog-recent">
            <div className="nav-big-blog-recent__heading">
              <span>Recent Blogs</span>
            </div>
            <Scrollbars
              autoHide
              autoHideTimeout={1000}
              autoHideDuration={200}
            >
              <List>
                {
                  listData.map((x, i) => (
                    <ListItem
                      key={generateKey('test-arr', i)}
                      tag={Link}
                      className="recent-list-item-link"
                      to={`/home/blog_page${x.url.split('.')[0]}`}
                      activated={url === x.url.split('.')[0]}
                    >
                      {x.name}
                    </ListItem>
                  ))
                }
              </List>
            </Scrollbars>
          </nav>
        </div>
        <nav className="bottom-nav-small">
          <button
            className="bottom-nav-items"
            type="button"
            onClick={() => self.setState({ bottomOutlineDrawer: !bottomOutlineDrawer })}
          >
            <Icon icon="vertical_split" iconOptions={{ strategy: 'ligature' }} />
            <span>Outline</span>
          </button>
          <div />
          <button
            className="bottom-nav-items"
            type="button"
            onClick={() => history.push('/home')}
          >
            <Icon icon="home" iconOptions={{ strategy: 'ligature' }} />
            <span>Home</span>
          </button>
          <div />
          <button
            className="bottom-nav-items"
            type="button"
            onClick={() => self.setState({ bottomRecentDrawer: !bottomRecentDrawer })}
          >
            <Icon icon="undo" iconOptions={{ strategy: 'ligature' }} />
            <span>Recent</span>
          </button>
        </nav>

        <div
          className={cx({ 'bottom-outline-drawer': true, '--close': !bottomOutlineDrawer })}
        >
          <div className="drawer-heading">
            <h2>Outline</h2>
            <Icon
              icon="close"
              iconOptions={{ strategy: 'ligature' }}
              onClick={() => self.setState({ bottomOutlineDrawer: !bottomOutlineDrawer })}
            />
          </div>
          <Scrollbars
            autoHide
            autoHideTimeout={1000}
            autoHideDuration={200}
          >
            <List
              id={`${self.outlineListId}-small`}
            />
          </Scrollbars>
        </div>

        <div
          className={cx({ 'bottom-recent-drawer': true, '--close': !bottomRecentDrawer })}
        >
          <div className="drawer-heading">
            <h2>Recent</h2>
            <Icon
              icon="close"
              iconOptions={{ strategy: 'ligature' }}
              onClick={() => self.setState({ bottomRecentDrawer: !bottomRecentDrawer })}
            />
          </div>
          <Scrollbars
            autoHide
            autoHideTimeout={1000}
            autoHideDuration={200}
          >
            <List>
              {
                listData.map((x, i) => (
                  <ListItem
                    key={generateKey('test-arr', i)}
                    tag={Link}
                    className="recent-list-item-link"
                    to={`/home/blog_page${x.url.split('.')[0]}`}
                    activated={url === x.url.split('.')[0]}
                  >
                    {x.name}
                  </ListItem>
                ))
              }
            </List>
          </Scrollbars>
        </div>

      </Fragment>
    );
  }
}

BlogPage.propTypes = {
  history: PropTypes.any.isRequired,
  location: PropTypes.any.isRequired,
  data: PropTypes.any.isRequired,
  fetchData: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
  listData: PropTypes.any.isRequired,
  listFetching: PropTypes.bool.isRequired,
  fetchListData: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    data: state.Home_BlogPage.data,
    fetching: state.Home_BlogPage.fetching,
    listData: state.Home_BlogsList.data,
    listFetching: state.Home_BlogsList.fetching,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: url => dispatch(fetchBlogPost(url)),
    fetchListData: () => dispatch(fetchBlogsList()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(BlogPage));
