import { Layout,Form,Input, Card,Button,Upload,message,Space } from 'antd';
import React from 'react';
import { LeftOutlined } from '@ant-design/icons';
import {RequestSaveSetting,RequestSetting }from "../Services"

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
      setting:{}
    };
  }

  onFinish = (values)=>{
    RequestSaveSetting(values).then(()=>{
        message.success("保存成功");
        this.props.history.replace("/#/applist")
    },()=>{
        message.error("保存失败");
    })
    
  }


  componentDidMount(){
    RequestSetting().then((response)=>{
        this.formRef.current.setFieldsValue({
            ...response.data.data
        })
    })
  }


  render(){
    let {setting} = this.state;
    return (
      <Layout style={{background:"transparent"}}>
        <Header style={{ position: 'fixed', zIndex: 1, width: '100%',padding: '0 8%',background:"#fff"}}>
         <a href="#/applist" style={{color:"#0066ff",fontSize:20}} ><LeftOutlined />返回应用页</a>
        </Header>
        <Content style={{ padding: '0 8%', marginTop: 100 }}>
            <Card title="修改配置">
                <Form
                    ref={this.formRef}
                    {...formItemLayout}
                    onFinish={this.onFinish}
                >
                    <Form.Item
                      label="主机IP"
                      name="host"
                      rules={[{ required: true, message: '请输入主机IP' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                      label="端口"
                      name="port"
                      rules={[{ required: true, message: '请输入端口' }]}
                    >
                        <Input defaultValue="3389" />
                    </Form.Item>
                    <Form.Item
                      label="用户名"
                      name="username"
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input  />
                    </Form.Item>
                    <Form.Item
                      label="密码"
                      name="password"
                      rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input  />
                    </Form.Item>
                   

                    <Form.Item 
                      {...tailLayout}
                    >
                      <Button type="primary" htmlType="submit">
                        保存
                      </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Content>
      </Layout>
      
    );
  }
}
  
export default AppForm;
  