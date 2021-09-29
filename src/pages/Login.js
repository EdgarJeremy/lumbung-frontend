import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Button,
  Form,
  FormInput,
  FormGroup
} from "shards-react";

class Login extends React.Component {
  render() {
    return (
      <div style={{ margin: '30px auto', maxWidth: 500 }}>
        <Card>
          <CardHeader>Login Lumbung Tani</CardHeader>
          <CardBody>
            <CardTitle>Lumbung Tani</CardTitle>
            <Form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              const formData = new FormData(form);
              this.props.onLogin(formData.get('username'), formData.get('password'));
            }}>
              <FormGroup>
                <label htmlFor="#username">Username</label>
                <FormInput name="username" id="#username" placeholder="Username" />
              </FormGroup>
              <FormGroup>
                <label htmlFor="#password">Password</label>
                <FormInput name="password" type="password" id="#password" placeholder="Password" />
              </FormGroup>
              <FormGroup>
                <Button>Login</Button>
              </FormGroup>
            </Form>
          </CardBody>
          <CardFooter>Lumbung untuk <a href="http://ladangtani.info/ghost">ladangtani.info</a></CardFooter>
        </Card>
      </div>
    )
  }
}

export default Login;
