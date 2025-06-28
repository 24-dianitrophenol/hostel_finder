import Layout from '../components/layout/Layout';
import SignupForm from '../components/features/auth/SignupForm';

const OwnerSignupPage = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <SignupForm />
      </div>
    </Layout>
  );
};

export default OwnerSignupPage;