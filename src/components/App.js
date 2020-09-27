import React from "react";
import { withAuthenticator } from '@aws-amplify/ui-react'
import Amplify from 'aws-amplify';
import awsconfig from '../aws-exports';
import "typeface-roboto";
import { GlobalState } from "./GlobalState";
import AppContainer from "./AppContainer";

Amplify.configure(awsconfig);

function App() {
  return (
    <GlobalState>
      <AppContainer />
    </GlobalState>
  );
}

export default withAuthenticator(App);
