import { Layout,Table, Button, Space,Row,Col,Modal,Input,message,Upload } from 'antd';
import React from 'react';
import { LeftOutlined,FileOutlined } from '@ant-design/icons';
import {RequestListFile,RequestDelFile,RequestUploadFile} from "../Services";
import moment from 'moment';
import {getFilesPath} from "../Request"

const { Content,Header } = Layout;

class Document extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
          fileList: [],
          CreateFolderModalVisable:false,
          newFolderName:"",
          currentPath:""
        };
    }

     columns = [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
          render:(item,row)=>{
            let path = encodeURIComponent(`${this.state.currentPath}/${item}`);
            return (
                <Space>
                    <FileOutlined  style={{fontSize:25}} />
                    <a style={{color:"#333"}} href={`/document/${path}`}>{item}</a>
                </Space>
            );
          }
        },
        {
          title: '文件大小',
          dataIndex: 'size',
          width:150,
          key: 'size',
          render:(item)=>{
            return item==="-1"?"":item+"字节";
          }
        },
        {
            title: '创建时间',
            width: 250,
            dataIndex: 'ctime',
            key: 'ctime',
            render:(item)=>{
             return moment(item).format('YYYY-MM-DD HH:mm:ss') 
            }
          },
        {
          title: '修改时间',
          width: 250,
          dataIndex: 'mtime',
          key: 'mtime',
          render:(item)=>{
           return moment(item).format('YYYY-MM-DD HH:mm:ss') 
          }
        },
        {
            title: '操作',
            width: 160,
            align:"center",
            render:(row)=>{
                return (
                    <Space >
                        <a href={getFilesPath(row.name)}>下载</a>

                        <Button onClick={()=>{
                            let delPath = this.state.currentPath+row.name;
                            if(row.directory){
                                delPath += "/";
                            }
                            RequestDelFile([delPath]).then(()=>{
                               message.success("删除成功");
                               this.loadFileList(this.state.currentPath);
                            })
                        }} type="link">删除</Button>
                    </Space>
                )
            }
          },
      ];

    componentDidMount(){
        let {path} = this.props.match.params;
        path = path.replace("%2F%2F","%2F")
        this.setState({
            currentPath:decodeURIComponent(path)
        },()=>{
            this.loadFileList(path);
        })
    }
    loadFileList(path){
        RequestListFile(path).then((response)=>{
            this.setState({
                fileList:response.data.data.files
            })
        })
    }
   
    handleCreateFolderModalCancel =  ()=>{
        this.setState({
            CreateFolderModalVisable:false
        })
    }
    
    render(){
        let { fileList} = this.state;
        return (
            <Layout style={{background:"transparent"}}>
                <Header style={{ position: 'fixed', zIndex: 1, width: '100%',background:"#fff"}}>
                    <a href="#/applist" style={{color:"#0066ff",fontSize:20}} ><LeftOutlined />返回应用页</a>
                </Header>
                <Content style={{ padding: '0 8%', marginTop: 100 }}>
                    <Row>
                        <Col>
                            <Space>
                                <Upload
                                    customRequest={(upload)=>{
                                        RequestUploadFile(upload.file).then(()=>{
                                            message.success("上传成功");
                                            this.loadFileList(this.state.currentPath);
                                        })
                                    }}
                                    method="POST"
                                    showUploadList={false}
                                >
                                    <Button  style={{width:150}} type="primary" size='large' >
                                        上传文件
                                    </Button>
                                </Upload>
                            </Space>
                        </Col>
                    </Row>
                    <Row style={{marginTop:10}}>
                        <Col>
                            <Space>
                                <Button style={{paddingLeft:0}} type="link" onClick={()=>{
                                    window.history.back();
                                }}>返回上一级</Button> | {this.state.currentPath}
                            </Space>
                        </Col>
                    </Row>
                    
                    <Table
                        style={{
                            marginTop:10
                        }}
                        dataSource={fileList}
                        columns={this.columns} />;
                    
                </Content>
            </Layout>
            
        );
    }
}

export default Document;
  