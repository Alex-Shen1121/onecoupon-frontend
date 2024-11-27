import React, { useState } from 'react';
import { Layout, Card, Typography, Button, Tooltip, Space, Modal, Input, message } from 'antd';
import { TagOutlined, UserOutlined, LogoutOutlined, PlusOutlined, UnorderedListOutlined, ToolOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { downloadTemplateFile } from '../api/couponApi';
import StatusBar from './common/StatusBar';

const { Header } = Layout;
const { Title } = Typography;

const ExtensionFeatures: React.FC = () => {
  // 用户信息（与其他页面保持一致）
  const userInfo = {
    userId: '100012345',
    username: 'shency',
    shopId: '1000501L'
  };

  // 处理下载模板文件
  const handleDownloadTemplate = async (rowNum: number) => {
    try {
      const blob = await downloadTemplateFile(rowNum);
      // 创建下载链接
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

  // 显示下载模板对话框
  const showDownloadModal = () => {
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
  };

  return (
    <div className="create-coupon-container">
      <div className="content-wrapper">
        <StatusBar userInfo={userInfo} />

        <Card className="create-coupon-card">
          <Title level={2} className="text-center mb-8">
            <ToolOutlined className="mr-2" />
            扩展功能
          </Title>

          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="优惠券模板推送" size="small">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <p>下载优惠券推送模板文件，用于批量推送优惠券。</p>
                  <p>请指定所需的模板行数，系统将生成对应行数的模板文件。</p>
                </div>
                <Button 
                  type="primary" 
                  onClick={showDownloadModal}
                >
                  下载推送模板
                </Button>
              </Space>
            </Card>

            {/* 可以在这里添加更多扩展功能卡片 */}
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default ExtensionFeatures; 