import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Layout, Card, Typography, Tooltip, Form, Input, Select, Row, Col, Modal, Descriptions, Upload, DatePicker, message } from 'antd';
import { TagOutlined, UserOutlined, LogoutOutlined, SearchOutlined, PlusOutlined, UnorderedListOutlined, EyeOutlined, ToolOutlined, UploadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { CouponTemplate, QueryParams, queryCouponTemplates, queryCouponTemplateDetail, terminateCouponTemplate, increaseCouponStock, createCouponTask, downloadTemplateFile } from '../api/couponApi';
import { TablePaginationConfig } from 'antd/es/table';
import StatusBar from './common/StatusBar';

const { Header } = Layout;
const { Title } = Typography;
const { Option } = Select;

const CouponList: React.FC = () => {
  const [form] = Form.useForm();
  const [distributeForm] = Form.useForm();
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

  // 添加查看详情的状态
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<CouponTemplate | null>(null);

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
        // 确保 data 存在且是数组
        const formattedData = result.data?.map(item => ({
          ...item,
          couponTemplateId: BigInt(item.couponTemplateId)
        })) || [];
        
        setData(formattedData);
        setPagination(prev => ({ 
          ...prev, 
          current: params.pageNum,
          pageSize: params.pageSize,
          total: result.total 
        }));
      } else {
        console.error('获取数据失败:', result.info);
        setData([]); // 清空数据
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      setData([]); // 清空数据
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
    
    // 直接调用 fetchData 进行查询
    await fetchData({
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

  // 处理查看详情
  const handleView = async (record: CouponTemplate) => {
    try {
      const result = await queryCouponTemplateDetail(record.couponTemplateId);
      if (result.code === "0" && result.data) {
        // 转换 ID 为 BigInt
        const couponDetail = {
          ...result.data,
          couponTemplateId: BigInt(result.data.couponTemplateId)
        };
        setCurrentCoupon(couponDetail);
        setIsViewModalVisible(true);
      } else {
        console.error('获取优惠券详情失败:', result.info);
      }
    } catch (error) {
      console.error('获取优惠券详情失败:', error);
    }
  };

  // 渲染详情弹窗内容
  const renderCouponDetails = () => {
    if (!currentCoupon) return null;

    return (
      <Descriptions bordered column={2}>
        <Descriptions.Item label="优惠券ID" span={2}>
          {currentCoupon.couponTemplateId.toString()}
        </Descriptions.Item>
        <Descriptions.Item label="优惠券名称" span={2}>
          {currentCoupon.name}
        </Descriptions.Item>
        <Descriptions.Item label="优惠券来源">
          {currentCoupon.source === 0 ? '店铺券' : '平台券'}
        </Descriptions.Item>
        <Descriptions.Item label="优惠对象">
          {currentCoupon.target === 0 ? `商品专属 (${currentCoupon.goods || '未指定商品'})` : '全店通用'}
        </Descriptions.Item>
        <Descriptions.Item label="优惠类型">
          {['立减券', '满减券', '折扣券'][currentCoupon.type] || '未知类型'}
        </Descriptions.Item>
        <Descriptions.Item label="库存">
          {currentCoupon.stock}
        </Descriptions.Item>
        <Descriptions.Item label="开始时间" span={2}>
          {moment(currentCoupon.validStartTime).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label="结束时间" span={2}>
          {moment(currentCoupon.validEndTime).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label="领取规则" span={2}>
          <pre style={{ margin: 0 }}>{currentCoupon.receiveRule}</pre>
        </Descriptions.Item>
        <Descriptions.Item label="消耗规则" span={2}>
          <pre style={{ margin: 0 }}>{currentCoupon.consumeRule}</pre>
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          {currentCoupon.status === 0 ? '生效中' : '已无效'}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  // 添加处理结束优惠券的函数
  const handleTerminate = async (record: CouponTemplate) => {
    Modal.confirm({
      title: '结束优惠券',
      content: '是否确认结束券模板？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await terminateCouponTemplate(record.couponTemplateId);
          if (result.code === "0") {
            // 操作成功后刷新列表
            fetchData({
              pageNum: pagination.current,
              pageSize: pagination.pageSize,
              ...form.getFieldsValue()
            });
          } else {
            console.error('结束优惠券失败:', result.info);
          }
        } catch (error) {
          console.error('结束优惠券失败:', error);
        }
      }
    });
  };

  // 添加处理增加库存的函数
  const handleIncreaseStock = async (record: CouponTemplate) => {
    Modal.confirm({
      title: '增加库存',
      content: (
        <div>
          <p>当前库存：{record.stock}</p>
          <Form.Item
            label="增加数量"
            name="increaseAmount"
            rules={[
              { required: true, message: '请输入增加数量' },
              { type: 'number', min: 1, message: '增加数量必须大于0' }
            ]}
          >
            <Input 
              type="number"
              min={1}  // 设置最小值为1
              onKeyPress={(e) => {
                // 禁止输入负号
                if (e.key === '-' || e.key === 'e') {
                  e.preventDefault();
                }
              }}
              // 失去焦点时检查值
              onBlur={(e) => {
                const value = parseInt(e.target.value);
                if (value < 1) {
                  e.target.value = '1';
                }
              }}
            />
          </Form.Item>
        </div>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: async (close) => {
        const increaseAmount = (document.querySelector('input[type="number"]') as HTMLInputElement)?.value;
        if (!increaseAmount || parseInt(increaseAmount) <= 0) {
          return;
        }
        
        try {
          const result = await increaseCouponStock(record.couponTemplateId, parseInt(increaseAmount));
          if (result.code === "0") {
            // 操作成功后刷新列表
            fetchData({
              pageNum: pagination.current,
              pageSize: pagination.pageSize,
              ...form.getFieldsValue()
            });
            close();
          } else {
            console.error('增加库存失败:', result.info);
          }
        } catch (error) {
          console.error('增加库存失败:', error);
        }
      }
    });
  };

  // 添加处理下载模板的函数
  const handleDownloadTemplate = async (rowNum: number) => {
    try {
      const blob = await downloadTemplateFile(rowNum);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '优惠券推送模板.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('模板文件下载成功');
    } catch (error) {
      console.error('下载模板文件失败:', error);
      message.error('下载模板文件失败');
    }
  };

  // 修改批量分发的处理函数
  const handleDistribute = (record: CouponTemplate) => {
    // 计算默认时间：当前时间加2小时，保留当前的分秒
    const defaultTime = moment()
      .add(2, 'hours')
      .set({
        second: moment().second(),
        millisecond: moment().millisecond()
      });

    Modal.confirm({
      title: '批量分发优惠券',
      width: 600,
      content: (
        <Form
          form={distributeForm}
          layout="vertical"
          initialValues={{
            taskName: '分发任务',
            notifyType: ['0'],
            sendType: '0',
            sendTime: defaultTime
          }}
        >
          <Form.Item
            name="taskName"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            name="notifyType"
            label="通知方式"
            rules={[{ required: true, message: '请选择通知方式' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择通知方式"
              options={[
                { label: '站内信', value: '0' },
                { label: '弹框推送', value: '1' },
                { label: '邮箱', value: '2' },
                { label: '短信', value: '3' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="sendType"
            label="发送类型"
            rules={[{ required: true, message: '请选择发送类型' }]}
          >
            <Select
              placeholder="请选择发送类型"
              options={[
                { label: '立即发送', value: '0' },
                { label: '定时发送', value: '1' },
              ]}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.sendType !== currentValues.sendType}
          >
            {({ getFieldValue }) =>
              getFieldValue('sendType') === '1' ? (
                <Form.Item
                  name="sendTime"
                  label="发送时间"
                  rules={[{ required: true, message: '请选择发送时间' }]}
                >
                  <DatePicker
                    showTime={{ defaultValue: defaultTime }}
                    format="YYYY-MM-DD HH:mm:ss"
                    disabledDate={(current) => current && current < moment().startOf('day')}
                    showNow={false}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="file"
            label={
              <Space>
                分发模板文件
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    Modal.confirm({
                      title: '下载模板文件',
                      content: (
                        <div>
                          <p>请输入模板行数：</p>
                          <Input 
                            type="number"
                            min={1}
                            defaultValue={100}
                            onKeyPress={(e) => {
                              if (e.key === '-' || e.key === 'e') {
                                e.preventDefault();
                              }
                            }}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value);
                              if (value < 1) {
                                e.target.value = '1';
                              }
                            }}
                          />
                        </div>
                      ),
                      okText: '下载',
                      cancelText: '取消',
                      onOk: async (close) => {
                        const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                        const rowNum = parseInt(input.value);
                        if (rowNum < 1) {
                          message.error('行数必须大于0');
                          return;
                        }
                        await handleDownloadTemplate(rowNum);
                        close();
                      }
                    });
                  }}
                >
                  下载模板
                </Button>
              </Space>
            }
            rules={[{ required: true, message: '请上传分发模板文件' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              accept=".xlsx,.xls"
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const values = await distributeForm.validateFields();
          const notifyType = values.notifyType.join(',');
          const sendTime = values.sendType === '1' ? 
            moment(values.sendTime).format('YYYY-MM-DD HH:mm:ss') : 
            null;

          const result = await createCouponTask(
            values.taskName,
            notifyType,
            record.couponTemplateId,
            values.sendType,
            sendTime,
            values.file[0].originFileObj
          );

          if (result.code === "0") {
            message.success('创建分发任务成功');
            distributeForm.resetFields(); // 清空表单
            Modal.destroyAll(); // 只在成功时关闭模态框
          } else {
            message.error(result.info || '创建分发任务失败');
            // 失败时不关闭模态框，让用户可以修改后重试
            return false; // 返回 false 阻止模态框关闭
          }
        } catch (error) {
          console.error('创建分发任务失败:', error);
          message.error('创建分发任务失败');
          return false; // 返回 false 阻止模态框关闭
        }
      }
    });
  };

  // 更新列定义，添加操作列
  const columns = [
    {
      title: '优惠券ID',
      dataIndex: 'couponTemplateId',
      key: 'couponTemplateId',
      width: 200,
      ellipsis: true,
      fixed: 'left' as const,
      render: (id: bigint) => id.toString(),
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
      title: '优惠对象',
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
        <Space direction="vertical" size="small">
          <span>开始：{moment(record.validStartTime).format('YYYY-MM-DD HH:mm:ss')}</span>
          <span>结束：{moment(record.validEndTime).format('YYYY-MM-DD HH:mm:ss')}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => status === 0 ? '生效中' : '已结束',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 100,
      render: (_: unknown, record: CouponTemplate) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              type="link" 
              size="small"
              style={{ padding: '4px 0', margin: 0 }}
              onClick={() => handleView(record)}
            >
              查看
            </Button>
            {record.status === 0 && (
              <>
                <Button 
                  type="link" 
                  size="small"
                  style={{ padding: '4px 0', margin: 0 }}
                  onClick={() => handleIncreaseStock(record)}
                >
                  增库
                </Button>
                <Button 
                  type="link" 
                  size="small"
                  style={{ padding: '4px 0', margin: 0 }}
                  onClick={() => handleDistribute(record)}
                >
                  分发
                </Button>
              </>
            )}
          </div>
          {record.status === 0 && (
            <Button 
              type="link" 
              size="small"
              danger
              style={{ padding: '4px 0', margin: 0 }}
              onClick={() => handleTerminate(record)}
            >
              结束
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="create-coupon-container">
      <div className="content-wrapper">
        <StatusBar userInfo={userInfo} />
        
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

      {/* 添加详情弹窗 */}
      <Modal
        title="优惠券详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {renderCouponDetails()}
      </Modal>
    </div>
  );
};

export default CouponList;