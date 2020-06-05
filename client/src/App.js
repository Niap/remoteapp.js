import React from 'react';
import AppList from "./pages/AppList"
import Document from "./pages/Document"
import Session from "./pages/Session"
import AppForm  from "./pages/AppForm"
import Setting  from "./pages/Setting"
import { HashRouter as Router, Route,Switch,Redirect } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/document/:path" component={Document} >
        </Route>
        <Route path="/session/:sessionId" component={Session} >
        </Route>
        <Route path="/app/:appid" component={AppForm} >
        </Route>
        <Route path="/setting"  component={Setting} >
        </Route>
        <Route path="/applist">
          <AppList />
        </Route>
        <Redirect from="/" to="applist" />
      </Switch>
    </Router>
  );
}

export default App;
