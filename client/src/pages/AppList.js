
import { Layout,Row,Col } from 'antd';
import React from 'react';
import {RequestAppList,RequestStartSession} from "../Services"
import {getImagePath} from "../Request"


const document = require('../images/document.png')
const defaultApp = require('../images/defaultApp.png')
const add = require('../images/add.png')

const { Content,Header } = Layout;

class AppItem extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      showEdit:false
    };
  }

  render(){
    return (
      <div
        onMouseEnter={()=>{
          this.setState({showEdit:true});
        }}
        onMouseLeave={()=>{
          this.setState({showEdit:false});
        }}
        style={{cursor:"pointer", position:"relative",width:120,margin:"auto"}}
      >
        <img onClick={this.props.onClick} alt="图片" style={{width:120,height:120}} src={this.props.icon} />
        <p style={{marginTop:10,fontSize:16,color:"#7f7f7f",textAlign:"center"}}>{this.props.name}</p>
        {this.state.showEdit&&!this.props.noedit?<a href={`#/app/${this.props.appId}`} style={{
          color:"#666",
          background:"rgba(255,255,255,0.8)",
          padding:0,
          paddingLeft:5,
          paddingRight:5,
          position:"absolute",
          right:0,
          top:0
        }}>编辑</a>:null}
      </div>      
    );
  }
}

class AppList extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      appList: []
    };
  }

  goToDocument=()=>{
    window.location.href = "#/document/%2F";
  }
  goToAdd=()=>{
    window.location.href = "#/app/add";
  }

  openApp = (appId)=>{
    RequestStartSession(appId).then((response)=>{
      window.location.href = "#/session/"+response.data.data.sessionId;
    });
  }

  componentDidMount(){
    RequestAppList().then((response)=>{
      this.setState({
        appList:response.data.data
      })
    })
  }

  render(){
    let {appList} = this.state;
    return (
      <Layout style={{background:"transparent"}}>
        <Header style={{ position: 'fixed', zIndex: 1, width: '100%',background:"#fff"}}>
          <a href="#/applist">LOGO</a>
        </Header>
        <Content style={{ padding: '0 8%', marginTop: 100 }}>
          <div style={{ padding: 24, minHeight: 380 }}>
          <Row gutter={[16, 24]}>
            <Col key="document" span={4}>
                <AppItem noedit={true} onClick={()=>this.goToDocument()} icon={document} name="文档库" />
            </Col>
            {appList.map((app)=>{
              return (<Col key={app.name} span={4}>
                <AppItem  onClick={()=>this.openApp(app.id)} icon={app.icon?getImagePath(app.icon):defaultApp} appId={app.id} name={app.name} />
              </Col>)
            })}
            <Col key="add" span={4}>
                <AppItem noedit={true} onClick={()=>this.goToAdd()} icon={add} name="添加" />
            </Col>
          </Row>
          </div>
        </Content>
      </Layout>
      
    );
  }
}
  
export default AppList;
  