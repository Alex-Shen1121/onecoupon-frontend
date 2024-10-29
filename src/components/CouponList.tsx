import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Layout, Card, Typography, Tooltip, Form, Input, Select, Row, Col } from 'antd';
import { TagOutlined, UserOutlined, LogoutOutlined, SearchOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { CouponTemplate, QueryParams, queryCouponTemplates } from '../api/couponApi';
import { TablePaginationConfig } from 'antd/es/table';

const { Header } = Layout;
const { Title } = Typography;
const { Option } = Select;

const CouponList: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<CouponTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ 
    current: 1, 
    pageSize: 10, 
    total: 0 
  });

  // 用户信息（与创建页面保持一致）
  const userInfo = {
    userId: '100012345',
    username: 'shency',
    shopId: '1000501L'
  };

  // 添加 useEffect 钩子，在组件挂载时执行默认搜索
  useEffect(() => {
    // 执行默认搜索
    fetchData({
      pageNum: 1,
      pageSize: 10
    });
  }, []); // 空依赖数组表示只在组件挂载时执行一次

  // 更新数据获取函数
  const fetchData = async (params: QueryParams) => {
    setLoading(true);
    try {
      const result = await queryCouponTemplates(params);
      
      if (result.code === "0") {
        setData(result.data);
        setPagination(prev => ({ 
          ...prev, 
          current: params.pageNum,
          pageSize: params.pageSize,
          total: result.total 
        }));
      } else {
        console.error('获取数据失败:', result.info);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理表格分页变化
  const handleTableChange = (paginationParams: TablePaginationConfig) => {
    const formValues = form.getFieldsValue();
    fetchData({
      pageNum: paginationParams.current || 1,
      pageSize: paginationParams.pageSize || 10,
      ...formValues,
    });
  };

  // 处理查询表单提交
  const handleSearch = async () => {
    const values = form.getFieldsValue();
    setPagination(prev => ({ ...prev, current: 1 })); // 重置到第一页
    fetchData({
      pageNum: 1,
      pageSize: pagination.pageSize,
      ...values,
    });
  };

  // 重置查询条件
  const handleReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({
      pageNum: 1,
      pageSize: pagination.pageSize,
    });
  };

  // 更新列定义
  const columns = [
    {
      title: '优惠券ID',
      dataIndex: 'couponTemplateId',
      key: 'couponTemplateId',
    },
    {
      title: '优惠券名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source: number) => source === 0 ? '店铺券' : '平台券',
    },
    {
      title: '使用围',
      dataIndex: 'target',
      key: 'target',
      render: (target: number, record: CouponTemplate) => {
        if (target === 0) {
          return `商品专属 (${record.goods || '未指定商品'})`;
        }
        return '全店通用';
      },
    },
    {
      title: '优惠类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: number) => {
        const types = ['立减券', '满减券', '折扣券'];
        return types[type] || '未知类型';
      },
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '有效期',
      key: 'validTime',
      render: (record: CouponTemplate) => (
        <Space>
          {moment(record.validStartTime).format('YYYY-MM-DD')} 至
          {moment(record.validEndTime).format('YYYY-MM-DD')}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => status === 0 ? '有效' : '无效',
    },
  ];

  return (
    <div className="create-coupon-container">
      <div className="content-wrapper">
        <Header className="status-bar">
          <div className="left-section">
            <div className="project-name">牛券</div>
            <div className="nav-links">
              <Link to="/create-coupon">
                <Button type="link" icon={<PlusOutlined />}>创建优惠券</Button>
              </Link>
              <Link to="/list">
                <Button type="link" icon={<UnorderedListOutlined />}>优惠券列表</Button>
              </Link>
            </div>
          </div>
          <div className="user-actions">
            <Tooltip title={
              <div>
                <p>用户ID: {userInfo.userId}</p>
                <p>用户名: {userInfo.username}</p>
                <p>商铺ID: {userInfo.shopId}</p>
              </div>
            }>
              <Button icon={<UserOutlined />} type="text">用户状态</Button>
            </Tooltip>
            <Button icon={<LogoutOutlined />} type="text">退出登录</Button>
          </div>
        </Header>
        
        <Card className="list-page-card">
          <Title level={2} className="text-center mb-8">
            <TagOutlined className="mr-2" />
            优惠券列表
          </Title>

          {/* 查询条件表单 */}
          <Form
            form={form}
            layout="horizontal"
            className="search-form"
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="name" label="优惠券名称">
                  <Input placeholder="输入优惠券名称" allowClear />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="target" label="优惠对象">
                  <Select placeholder="选择优惠对象" allowClear>
                    <Option value={0}>商品专属</Option>
                    <Option value={1}>全店通用</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => prevValues.target !== currentValues.target}
                >
                  {({ getFieldValue }) =>
                    getFieldValue('target') === 0 ? (
                      <Form.Item name="goods" label="优惠商品编码">
                        <Input placeholder="输入商品编码" allowClear />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="type" label="优惠类型">
                  <Select placeholder="选择优惠类型" allowClear>
                    <Option value={0}>立减券</Option>
                    <Option value={1}>满减券</Option>
                    <Option value={2}>折扣券</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={16} style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={handleReset}>重置</Button>
                  <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                    查询
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>

          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            onChange={handleTableChange}
            rowKey="couponTemplateId"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </div>
    </div>
  );
};

export default CouponList;