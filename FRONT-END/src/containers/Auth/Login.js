import React, { useEffect } from 'react';
import { AuthContent, InputWithLabel, AuthButton, RightAlignedLink, AuthError } from 'components/Auth';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as authActions from 'redux/modules/auth';
import * as userActions from 'redux/modules/user';
import storage from 'lib/storage';

function Login({ form, result, error, AuthActions, UserActions, history }) {
  
  useEffect(() => {
    return () => {
      AuthActions.initializeForm('login');
    };
  }, [AuthActions])

  const setError = message => {
    AuthActions.setError({form: 'login', message});
    return false;
  }

  const handleChange = e => {
    const { name, value } = e.target;
    AuthActions.changeInput({
      name,
      value,
      form: 'login'
    })
  };

  const handleLocalLogin = async () => {
    const { email, password } = form.toJS();

    try {
      await AuthActions.localLogin({email, password});
      const loggedInfo = result.toJS();

      UserActions.setLoggedInfo(loggedInfo);
      history.push('/');
      storage.set('loggedInfo', loggedInfo);
    } catch (error) {
      setError('잘못된 계정정보입니다.')
    }
  }

  return (
    <AuthContent title="로그인">
      <InputWithLabel label="아이디" name="email" placeholder="이메일" onChange={handleChange}/>
      <InputWithLabel label="비밀번호" name="password" placeholder="비밀번호" type="password" onChange={handleChange}/>
      {
        error && <AuthError>{ error }</AuthError>
      }
      <AuthButton onClick={handleLocalLogin}>로그인</AuthButton>
      <RightAlignedLink to="/auth/register">회원가입</RightAlignedLink>
    </AuthContent>
  );
};

export default connect(
  (state) => ({
      form: state.auth.getIn(['login', 'form']),
      error: state.auth.getIn(['login', 'error']),
      result: state.auth.get('result')
  }),
  (dispatch) => ({
    AuthActions: bindActionCreators(authActions, dispatch),
    UserActions: bindActionCreators(userActions, dispatch)
  })
)(Login);