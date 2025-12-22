import React from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import NotesTable from "./notes";

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/notes" exact component={NotesTable} />{" "}
          <Route path="/" exact component={Login} />{" "}
          {/* Default to login page */}
        </Switch>
      </div>
    </Router>
  );
}

export default App;
