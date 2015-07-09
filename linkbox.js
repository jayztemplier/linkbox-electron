window.$ = window.jQuery = require("./libs/jquery.min.js");
var shell = require('shell');

var CommentBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadCommentsFromServer: function() {
    console.log(this.props.url);
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <div className="commentBox">
      <h1 className="title row">LinkBox</h1>
      <CommentList data={this.state.data}/>
      </div>
    );
  }
});
var Comment = React.createClass({
  handleClick: function(event) {
    shell.openExternal(this.props.children.toString());
  },
  render: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return (
      <div className="comment row" onClick={this.handleClick}>
      <h4 className="commentAuthor">
      {this.props.title.substr(0, 40)}
      </h4>
      <a href={this.props.children.toString()} target="#">{this.props.children.toString().substr(0, 50)}</a>
      <br/>
      </div>
    );
  }
});

var CommentList = React.createClass({
  getInitialState: function() {
    return {searchString: '', filteredData: this.props.data};
  },
  handleChange: function(e){
    var links = this.props.data,
    rawSearchString = e.target.value,
    searchString = rawSearchString.trim().toLowerCase();

    if(searchString.length > 0){
      links = links.filter(function(l){
        return l.title.toLowerCase().match( searchString );
      });
    } else {
      links = this.props.data;
    }
    this.setState({searchString:rawSearchString, filteredData: links});
  },
  componentDidMount: function() {
    $(document.body).on('keydown', this.handleKeyDown);
    React.findDOMNode(this.refs.search).focus();
  },
  componentWillUnMount: function() {
    $(document.body).off('keydown', this.handleKeyDown);
  },
  handleKeyDown: function(e) {
    var ENTER = 13;
    if( e.keyCode == ENTER ) {
      var searchString = this.state.searchString.trim().toLowerCase();
      var links = searchString.length > 0 ? this.state.filteredData : this.props.data;
      if (links.length > 0) {
        shell.openExternal(links[0].url);
      }
    }
  },
  render: function() {
    var searchString = this.state.searchString.trim().toLowerCase();
    var links = searchString.length > 0 ? this.state.filteredData : this.props.data;
    var commentNodes = links.map(function (comment) {
      return (
        <Comment title={comment.title}>
        {comment.url}
        </Comment>
      );
    });
    return (
      <div className="commentList">
      <input ref="search" id="search" className="form-control" type="text" value={this.state.searchString} onChange={this.handleChange} placeholder="Type here" />
      {commentNodes}
      </div>
    );
  }
});
var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value = '';
    return;
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
      <input type="text" placeholder="Your name" ref="author" />
      <input type="text" placeholder="Say something..." ref="text" />
      <input type="submit" value="Post" />
      </form>
    );
  }
});

React.render(
  <CommentBox url="http://linkboxapp.herokuapp.com/iframe/bookmarks.json?api_key=" pollInterval={10000}/>,
  document.getElementById('content')
);

$(document).on('click','a', function(e) {
     e.preventDefault(true);
     var elem = $(this);
     var url = elem.attr('href');
     shell.openExternal(url);
 });

 var ipc = require('ipc');
 ipc.on('ping', function(arg){
   document.getElementById('search').focus()
   window.scrollTo(0,0);
});

 // var remote = require('remote');
 // var Menu = remote.require('menu');
 // var template = [
 //   {
 //     label: 'Electron',
 //     submenu: [
 //       {
 //         label: 'About Electron',
 //         selector: 'orderFrontStandardAboutPanel:'
 //       },
 //       {
 //         label: 'Focus',
 //         accelerator: 'Command+U',
 //         selector: 'focusWindow:'
 //       },
 //       {
 //         type: 'separator'
 //       },
 //       {
 //         label: 'Quit',
 //         accelerator: 'Command+Q',
 //         selector: 'terminate:'
 //       },
 //     ]
 //   }
 // ];
 // window.addEventListener('contextmenu', function (e) {
 //   e.preventDefault();
 //   menu.popup(remote.getCurrentWindow());
 // }, false);
 //
 // menu = Menu.buildFromTemplate(template);
 //
 // Menu.setApplicationMenu(menu);
