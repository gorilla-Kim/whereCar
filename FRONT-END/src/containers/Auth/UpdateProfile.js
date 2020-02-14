import React, { useEffect } from 'react';
import { AuthContent, InputWithLabel, AuthButton, RightAlignedLink, AuthError } from 'components/Auth';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authActions from 'redux/modules/auth';
import * as userActions from 'redux/modules/user';
import storage from 'lib/storage';
import {isEmail, isLength, isAlphanumeric} from 'validator';
import debounce from 'lodash/debounce';


function UpdateProfile({ form, error, user, result, AuthActions, UserActions, history }) {
  const { email, displayName, password, passwordConfirm } = form.toJS();

  useEffect(() => {
    // 초기에 input값 초기화가 필요
    return () => {
      AuthActions.changeInput({
        name: 'email',
        value: user.getIn(['loggedInfo', 'email']),
        form: 'register'
      });
      AuthActions.changeInput({
        name: 'displayName',
        value: user.getIn(['loggedInfo', 'displayName']),
        form: 'register'
      });
    };
  }, [AuthActions, user]);

  const setError = (message) => {
    AuthActions.setError({ form: 'register', message });
  }

  const validate = {
    email: value => {
      if(!isEmail(value)) {
        setError('잘못된 이메일 형식입니다.');
        return false;
      }
      return true;
    },
    displayName: value => {
      if(!isAlphanumeric(value) || !isLength(value, { min: 4, max: 15 })) {
        setError('아이디는 4~15 글자의 알파벳 혹은 숫자로 이뤄져야 합니다.');
        return false;
      }
      return true;
    },
    password: value => {
      if(!isLength(value, { min: 6 })){
        setError('비밀번호를 6자 이상 입력하세요.');
        return false
      }
      setError(null); // 이메일과 아이디는 에러 null 처리를 중복확인 부분에서 하게 됩니다
      return true;
    },
    passwordConfirm: value => {
      if(!isLength(value, { min: 6 })){
        setError('비밀번호를 6자 이상 입력하세요.');
        return false
      } else if(form.get('password') !== value) {
        setError(`비밀번호 확인이 일치하지 않습니다.`);
        return false;
      }
      setError(null);
      return true;
    }
  };

  const checkDisplayNameExists = debounce(async displayName => {
    try {
      const result = await AuthActions.checkDisplayNameExists(displayName);
      if(user.getIn(['loggedInfo', 'displayName'])===displayName) {
        setError(null);
      }
      else if(result.data.exists) {
        setError('이미 존재하는 아이디입니다.');
      } else {
        setError(null);
      }
    } catch (error) {
      console.log(error);
    }
  }, 300);

  const handleChange = e => {
    const { name, value } = e.target;
    AuthActions.changeInput({
      name,
      value,
      form: 'register'
    });
    
    const validation = validate[name](value);
    if(name.indexOf('password') > -1 || !validation) return; // 비밀번호 검증이거나, 검증 실패하면 여기서 마침

    checkDisplayNameExists(value);
  };

  const handleUpdateUser = async () => {
    if(error) return; // 현재 에러가 있는 상태라면 진행하지 않음

    if(!validate['email'](email)||
      !validate['displayName'](displayName)||
      !validate['password'](password)||
      !validate['passwordConfirm'](passwordConfirm)) return; // 하나라도 실패하면 진행하지 않음
    
    try {
      await AuthActions.updateUser({
        email,
        displayName,
        password
      }).then(
        result => {
          const loggedInfo = result.data;
          storage.set('loggedInfo', loggedInfo);
          UserActions.setLoggedInfo(loggedInfo);
          UserActions.setValidated(true);
      });

      history.push('/'); // 프로필 업데이트 성공시 홈페이지로 이동
    } catch (error) {
      // 에러 처리하기
      if(error.response.status === 409) {
        const { key } = error.response.data;
        const message = key === 'email' ? '이미 존재하는 이메일입니다.' : '이미 존재하는 아이디입니다.';
        setError(message);
      }
      setError('알 수 없는 에러가 발생했습니다.')
    }
  }

  return (
    <AuthContent title="프로필 수정">
        <InputWithLabel meta={email} label="이메일"/>
        <InputWithLabel value={displayName} label="닉네임" name="displayName" placeholder="닉네임" onChange={handleChange} />
        <InputWithLabel value={password} label="비밀번호" name="password" placeholder="비밀번호" type="password" onChange={handleChange} />
        <InputWithLabel value={passwordConfirm} label="비밀번호 확인" name="passwordConfirm" placeholder="비밀번호 확인" type="password" onChange={handleChange} />
        {
          error && <AuthError>{error}</AuthError>
        }
        <AuthButton onClick={handleUpdateUser}>프로필수정</AuthButton>
        <RightAlignedLink to="/">비워둠(홈으로 이동)</RightAlignedLink>
    </AuthContent>
  );
};

export default connect(
  (state) => ({
    form: state.auth.getIn(['register', 'form']),
    error: state.auth.getIn(['register', 'error']),
    result: state.auth.get('result'),
    user: state.user
  }),
  (dispatch) => ({
    AuthActions: bindActionCreators(authActions, dispatch),
    UserActions: bindActionCreators(userActions, dispatch)
  })
)(UpdateProfile);