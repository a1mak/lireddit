import { withUrqlClient } from "next-urql";
import React from "react";
import Feed from "../components/Feed";
import Layout from "../components/Layout";
import { createUrqlClient } from "../urql-client";

const Index = () => {
  return (
    <Layout>
      <Feed />
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
