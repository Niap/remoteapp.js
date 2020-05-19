import { Layout,Table, Button, Space,Row,Col,Modal,Input,message,Upload } from 'antd';
import React from 'react';
import { LeftOutlined,FolderOutlined,FileOutlined } from '@ant-design/icons';
import {RequestListPath,RequestNewFolder,RequestDelPath,RequestUpload} from "../Services";
import moment from 'moment';


const { Content,Header } = Layout;

class Document extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
          fileList: [],
          CreateFolderModalVisable:false,
          newFolderName:"",
          currentPath:"%2F"
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
                    {row.directory?<FolderOutlined style={{fontSize:25}} />:<FileOutlined  style={{fontSize:25}} />}
                    <a style={{color:"#333"}} href={`/document/${path}`}>{item}</a>
                </Space>
            );
          }
        },
        {
          title: '文件大小',
          dataIndex: 'contentLength',
          width:150,
          key: 'contentLength',
          render:(item)=>{
            return item==="-1"?"":item;
          }
        },
        {
          title: '修改时间',
          width: 250,
          dataIndex: 'modified',
          key: 'modified',
          render:(item)=>{
           return moment(item).format('YYYY-MM-DD HH:mm:ss') 
          }
        },
        {
            title: '操作',
            width: 80,
            align:"center",
            render:(row)=>{
                return (
                    <Space >
                        <Button onClick={()=>{
                            let delPath = this.state.currentPath+row.name;
                            if(row.directory){
                                delPath += "/";
                            }
                            RequestDelPath([delPath]).then(()=>{
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
        RequestListPath(path).then((response)=>{
            this.setState({
                fileList:response.data.data
            })
        })
    }
    handleCreateFolderModalOk = ()=>{
        let parentPath = this.state.currentPath;
        let path = this.state.newFolderName;
        RequestNewFolder(path,parentPath).then((response)=>{
            message.success('创建文件夹成功');
            this.setState({
                CreateFolderModalVisable:false
            },()=>{
                this.loadFileList(parentPath);
            })
        },()=>{

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
                                        RequestUpload(this.state.currentPath,upload.file.name,upload.file).then(()=>{
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
                                <Button style={{width:150}} onClick={()=>{
                                    this.setState({
                                        CreateFolderModalVisable:true
                                    })
                                }} size='large' >创建文件夹</Button>
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
                    <Modal
                        title="创建文件夹"
                        visible={this.state.CreateFolderModalVisable}
                        onOk={()=>{
                            this.handleCreateFolderModalOk();
                        }}
                        onCancel={this.handleCreateFolderModalCancel}
                    >
                        <Input onChange={(event)=>{
                           this.setState({
                                newFolderName:event.target.value
                           }) 
                        }} placeholder="请输入新建文件夹名称" />
                    </Modal>
                </Content>
            </Layout>
            
        );
    }
}

export default Document;
  