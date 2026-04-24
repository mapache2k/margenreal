import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: { destination: '/calculadora-ml', permanent: true },
  };
};

export default function Calculadora() { return null; }
