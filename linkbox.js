window.$ = window.jQuery = require("./libs/jquery.min.js");
var shell = require('shell');

var CommentBox = React.createClass({
  getInitialState: function() {
    return {data: [], apiKey: localStorage.getItem('apiKey')};
  },
  loadCommentsFromServer: function() {
    if (this.state.apiKey) {
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        cache: false,
        data: {api_key: this.state.apiKey},
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          alert(err.toString());
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    }
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  handleAuthenticationSubmit: function(credentials) {
    $.ajax({
      url: 'http://linkboxapp.herokuapp.com/login.json',
      dataType: 'json',
      type: 'POST',
      data: credentials,
      success: function(data) {
        console.log(data);
        this.setState({apiKey: data.api_key});
        localStorage.setItem('apiKey', data.api_key);
        this.loadCommentsFromServer();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleLogout: function (e) {
    localStorage.removeItem('apiKey');
    this.setState({apiKey: null});
    console.log("coucou");
  },
  render: function() {
    if (this.state.apiKey) {
      return (
        <div className="commentBox">
        <CommentList data={this.state.data}/>
        <a className="logout" onClick={this.handleLogout}>logout</a>
        </div>
      );
    } else {
      return (
        <AuthenticationForm onAuthenticationSubmit={this.handleAuthenticationSubmit}/>
      );
    }
  }
});

// Authentication
var AuthenticationForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var email = React.findDOMNode(this.refs.email).value.trim();
    var password = React.findDOMNode(this.refs.password).value.trim();
    if (!email || !password) {
      return;
    }
    this.props.onAuthenticationSubmit({email: email, password: password});
    React.findDOMNode(this.refs.email).value = '';
    React.findDOMNode(this.refs.password).value = '';
    return;
  },
  render: function() {
    return (
      <div className="authentication">
      <form className="form-horizontal" onSubmit={this.handleSubmit}>
      <input className="form-control" type="text" placeholder="email" ref="email" />
      <input className="form-control" type="password" placeholder="password" ref="password" />
      <div class="col-sm-offset-2 col-sm-10">
      <input type="submit" value="Post" className="btn btn-default" />
      </div>
      </form>
      </div>
    );
  }
});

// Comment
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



React.render(
  <CommentBox url="http://linkboxapp.herokuapp.com/iframe/bookmarks.json" pollInterval={10000}/>,
  document.getElementById('app-content')
);

$(document).on('click','a', function(e) {
     e.preventDefault(true);
 });

 var ipc = require('ipc');
 ipc.on('ping', function(arg){
   var e = document.getElementById('search');
   if (e) {
     e.focus()
     window.scrollTo(0,0);
   }
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
