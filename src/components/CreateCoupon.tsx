import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Button, Card, Typography, message, Row, Col, DatePicker, Tooltip, Layout } from 'antd';
import { ShopOutlined, TagOutlined, UserOutlined, LogoutOutlined, PlusOutlined, UnorderedListOutlined, ToolOutlined } from '@ant-design/icons';
import { CouponState } from '../types/coupon';
import { createCouponTemplate } from '../api/couponApi';
import moment from 'moment';
import { Link } from 'react-router-dom';
import StatusBar from './common/StatusBar';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Header } = Layout;

// 配置全局 message
message.config({
  top: 20,
  duration: 2,
  maxCount: 3,
});

const CreateCoupon: React.FC = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  // 用户信息（暂时使用默认值）
  const userInfo = {
    userId: '100012345',
    username: 'shency',
    shopId: '1000501L'
  };

  const onFinish = async (values: CouponState) => {
    setIsLoading(true);
    console.log('Submitting form with values:', values);
    try {
      const responseData = await createCouponTemplate(values);
      console.log('Response data:', responseData);

      if (responseData.code === "0") {
        message.success(responseData.info);
        form.resetFields(); // 清空表单
      } else {
        message.error(responseData.info);
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      message.error('优惠券创建失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultConfig = () => {
    form.setFieldsValue({
      name: "示例优惠券",
      source: "0",
      target: "1",
      type: "1",
      validTime: [
        moment(),
        moment().add(1, 'minutes')
      ],
      stock: 91,
      receiveRule: "{}",
      consumeRule: "{}"
    });
  };

  return (
    <div className="create-coupon-container">
      <div className="content-wrapper">
        <StatusBar userInfo={userInfo} />
        <Card className="create-coupon-card">
          <Title level={2} className="text-center mb-8">
            <TagOutlined className="mr-2" />
            创建新优惠券
          </Title>
          <Button onClick={setDefaultConfig} style={{ marginBottom: '20px' }}>默认配置</Button>
          <Form
            form={form}
            name="coupon_form"
            onFinish={onFinish}
            layout="vertical"
            initialValues={{
              source: '0',
              target: '1',
              type: '1',
              stock: 1,
              receiveRule: '{}',
              consumeRule: '{}',
              validTime: [moment(), moment().add(2, 'days')]
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label="优惠券名称" rules={[{ required: true, message: '请输入优惠券名称' }]}>
                  <Input prefix={<ShopOutlined />} placeholder="输入优惠券名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="source" label="优惠券来源">
                  <Select>
                    <Option value="0">店铺券</Option>
                    <Option value="1">平台券</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="target" label="优惠对象">
                  <Select>
                    <Option value="0">商品专属</Option>
                    <Option value="1">全店通用</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => prevValues.target !== currentValues.target}
                >
                  {({ getFieldValue }) =>
                    getFieldValue('target') === '0' ? (
                      <Form.Item name="goods" label="优惠商品编码">
                        <Input placeholder="输入商品编码" />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="type" label="优惠类型">
                  <Select>
                    <Option value="0">立减券</Option>
                    <Option value="1">满减券</Option>
                    <Option value="2">折扣券</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item 
                  name="validTime" 
                  label="有效期" 
                  rules={[{ required: true, message: '请选择有效期' }]}
                >
                  <RangePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    className="w-full"
                    placeholder={['开始时间', '结束时间']}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item 
                  name="stock" 
                  label="库存" 
                  rules={[
                    { required: true, message: '请输入库存数量' },
                    { type: 'number', min: 1, message: '库存必须大于等于1' }
                  ]}
                >
                  <InputNumber min={1} className="w-full" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="receiveRule" label="领取规则 (JSON格式)">
                  <TextArea rows={4} placeholder="输入JSON格式的领取规则" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="consumeRule" label="消耗规则 (JSON格式)">
                  <TextArea rows={4} placeholder="输入JSON格式的消耗规则" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isLoading} className="w-full">
                {isLoading ? '创建中...' : '创建优惠券'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CreateCoupon;
