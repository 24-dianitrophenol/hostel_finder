import Layout from '../components/layout/Layout';
import LoginForm from '../components/features/auth/LoginForm';

const BrokerLoginPage = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <LoginForm />
      </div>
    </Layout>
  );
};

export default BrokerLoginPage;