import React from 'react';
import Header, { LoginButton, ProfileButton, AdminButton } from 'components/Base/Header';
import { connect } from 'react-redux';
import * as userActions from 'redux/modules/user';
import storage from 'lib/storage';
import { bindActionCreators } from 'redux';

function HeaderContainer({ visible, user, UserActions }) {
  if(!visible) return null;
  /* 
    [ Logout handler ]
    로그아웃을 할 때에는, 로그아웃 요청을 하고, 로컬스토리지도 비워주어야 합니다.
  */
  const handleLogout = async () => {
    try {
      // Logout API 요청하는 Action
      await UserActions.logout();
    } catch (error) {
      console.log(error);
    };
    // delete loggedInfo&adminInfo data in local storage
    storage.remove('loggedInfo');
    storage.remove('adminInfo');
    // reflash current page to Home
    window.location.href = '/';
  };

  return (
      <Header>
        { user.get('logged')
          ? <>
              {!user.getIn(['loggedInfo', 'adminInfo']) ? 
                  <AdminButton to="/auth/admin/register" content="관리자 가입"/>
                : <AdminButton to="/auth/admin/management" content="관리자 페이지"/>
              }
              <ProfileButton displayName={user.getIn(['loggedInfo', 'displayName'])} handleLogout={handleLogout}/>
            </>
          : <LoginButton/>
        }
      </Header>
  );
};

export default connect(
  (state) => ({
    visible: state.base.getIn(['header', 'visible']),
    user: state.user
  }),
  (dispatch) => ({
    UserActions: bindActionCreators(userActions, dispatch)
  })
)(HeaderContainer);