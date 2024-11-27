import React from 'react';
import { Layout, Button, Tooltip } from 'antd';
import { UserOutlined, LogoutOutlined, PlusOutlined, UnorderedListOutlined, ToolOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Header } = Layout;

interface UserInfo {
  userId: string;
  username: string;
  shopId: string;
}

interface StatusBarProps {
  userInfo: UserInfo;
}

const StatusBar: React.FC<StatusBarProps> = ({ userInfo }) => {
  return (
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
          <Link to="/extension">
            <Button type="link" icon={<ToolOutlined />}>扩展功能</Button>
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
  );
};

export default StatusBar; 