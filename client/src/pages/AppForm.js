import { Layout,Form,Input, Card,Button,Upload,message,Space } from 'antd';
import React from 'react';
import { LeftOutlined } from '@ant-design/icons';
import {RequestAppInfo,RequestSaveAppInfo,RequestAddAppInfo,RequestDelAppInfo} from "../Services"
import {api,getImagePath} from "../Request"

const { Content,Header } = Layout;

const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 6 },
  };

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
class AppForm extends React.Component{
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      iconUrl:null
    };
  }

  onFinish = (values)=>{
    let appid = this.props.match.params.appid;
    if(appid === "add"){
      RequestAddAppInfo(values).then(()=>{
        message.success("保存成功");
        this.props.history.replace("/#/applist")
      },()=>{
        message.error("保存失败");
      })
    }else{
      RequestSaveAppInfo(appid,values).then(()=>{
        message.success("保存成功");
        this.props.history.replace("/#/applist")
      },()=>{
        message.error("保存失败");
      })
    }
    
  }


  componentDidMount(){
    let appid = this.props.match.params.appid;
    if(appid !== "add"){
     
      RequestAppInfo(appid).then((response)=>{
        this.setState({
          iconUrl:response.data.data.app.icon
        })
        this.formRef.current.setFieldsValue({
          ...response.data.data.app
        })
      })
    }
   
  }

  handleChange = info => {
    if (info.file.status === 'done') {
      let iconUrl = `${info.file.response.data.file.filename}`;
      this.setState({
        iconUrl
      })
      let values = this.formRef.current.getFieldValue();
      values['icon'] = iconUrl;
      this.formRef.current.setFieldsValue(values);
    }
  };

  render(){
    var {iconUrl} = this.state;
    return (
      <Layout style={{background:"transparent"}}>
        <Header style={{ position: 'fixed', zIndex: 1, width: '100%',background:"#fff"}}>
         <a href="#/applist" style={{color:"#0066ff",fontSize:20}} ><LeftOutlined />返回应用页</a>
        </Header>
        <Content style={{ padding: '0 8%', marginTop: 100 }}>
            <Card title="修改应用">
                <Form
                    ref={this.formRef}
                    {...formItemLayout}
                    onFinish={this.onFinish}
                >
                    <Form.Item
                      label="应用名"
                      name="name"
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input  />
                    </Form.Item>
                    <Form.Item
                        label="别名"
                        name="cmd"
                        rules={[{ required: true, message: '请输入别名' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="图标"
                        name="icon"
                        rules={[{ required: true, message: '请输入图标' }]}
                    >
                        {iconUrl ? <img src={getImagePath(iconUrl)} alt="icon" style={{ width: 60,marginRight:10,marginLeft:10 }} /> : null}
                        <Upload 
                          showUploadList={false}
                          action={`${api}api/upload/icon`}
                          onChange={this.handleChange}
                          
                        >
                          <Button>上传</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item 
                      {...tailLayout}
                    >
                      <Space><Button type="primary" htmlType="submit">
                        保存
                      </Button>
                      <Button 
                        disabled={ this.props.match.params.appid =="add"}
                        onClick={()=>{
                        RequestDelAppInfo(this.props.match.params.appid).then(()=>{
                          message.success("删除成功");
                          this.props.history.replace("/#/applist")
                        },()=>{
                          message.error("删除失败")
                        })
                      }} type="danger" >
                        删除
                      </Button></Space>
                    </Form.Item>
                </Form>
            </Card>
        </Content>
      </Layout>
      
    );
  }
}
  
export default AppForm;
  