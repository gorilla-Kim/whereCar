import React, { useEffect, useState } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { makeStyles } from '@material-ui/core/styles'

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as listActions from 'redux/modules/list';

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { FavoriteExtendListItem } from 'components/Base/List';
import StarIcon from '@material-ui/icons/Star';
import { yellow } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
      height: '21rem',
      // maxWidth: 400,
      backgroundColor: theme.palette.background.paper,
      position: 'relative',
      overflow: 'auto',
      maxHeight: '21rem',
    },
    listSection: {
      backgroundColor: 'inherit',
    },
    ul: {
      backgroundColor: 'inherit',
      padding: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary
    },
    button: {
      backgroundColor: "#ffac32",
      borderColor: "#ffac32",
      marginLeft: 100,
      "&:hover": {
        backgroundColor: "#ffac32",
        borderColor: "#ffac32"
      },
      "&:active": {
        backgroundColor: "#ffac32",
        borderColor: "#ffac32"
      }
    },
    padding:{
      paddingRight : 10
    },
    contentbox:{
      height: '21rem',
      backgroundColor: theme.palette.background.paper,
      position: 'relative',
      overflow: 'auto',
    },
    inCar:{
      backgroundColor: '#0ca678',
      color: 'white'
      // [문정민] 아래 보더인지 shadow인지 없애시오
    },
    none:{},
    skeleton: {
      width: '300px',
      height: '30px'
    }
  }));

function CarItem({ groupId, courseInfo, ListActions }) {
  const classes = useStyles();
  const [data, setData] = useState ({})

  useEffect(()=>{
    const result = ListActions.getCourses({id: groupId});
  }, [ListActions])

  useEffect(()=>{
    if(courseInfo.groupInfo._id == groupId) {
      setData({
        ...courseInfo
      });
    }
  }, [courseInfo])
  
  // 아이 탑승 여부에 따라서 학원 색상이 변경!
  // 여기다가 아이가 탑승했다는 값을 받아와서 비교하고 아이가 탑승하고 있다면 색상 변경하는 id를 반환
  const childin =false;

  // 색상 변경하는 id를 반환하는 함수
  function checkchild(){
    return classes.inCar
  }

  // 색상 변경하지 않는 id를 반환하는 함수
  function none(){
    return classes.none
  }
 
  // Expend 부분 
  const [expanded, setExpanded] = React.useState(false);
  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return data.groupInfo !== undefined ? (
    <ExpansionPanel className = {childin === true ? checkchild() : none()} >
      {/*child 값에 따라서 색상 변경*/}
      <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
      >
          <StarIcon style={{ color: yellow[500] }} className={classes.padding}/>
          <Typography className={classes.heading}>이름: {data.groupInfo.name}</Typography>
          {/* 위의 현재: 이후의 {}안에 현재 위치 값 받아오기를 넣어야 한다!*/}
      </ExpansionPanelSummary>
      {
        data.courseList.map(obj => (
          <ExpansionPanelDetails>
              <FavoriteExtendListItem title={obj.courseName} subContent={obj.stations}/>
          </ExpansionPanelDetails>
        ))
      }
    </ExpansionPanel>
  ) 
  : (<div className={classes.skeleton}>
      <Skeleton animation="wave" />
    </div>)
}

export default connect(
  (state) => ({
    courseInfo: state.list.get('courseInfo').toJS(),
  }),
  (dispatch) => ({
    ListActions: bindActionCreators(listActions, dispatch) 
  })
)(CarItem);