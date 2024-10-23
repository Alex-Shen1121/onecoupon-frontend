import React from 'react';
import { Typography, Button } from 'antd';
import { Link } from 'react-router-dom';
import { TagOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="content-wrapper">
        <Title level={1} className="main-title">
          <TagOutlined className="title-icon" /> 牛券 oneCoupon
        </Title>
        <Title level={3} className="subtitle">@alexshen</Title>
        <Link to="/create-coupon">
          <Button type="primary" size="large" className="create-button">
            创建优惠券
          </Button>
        </Link>
      </div>
      <div className="background-element left-top"></div>
      <div className="background-element right-bottom"></div>
    </div>
  );
};

export default Home;
