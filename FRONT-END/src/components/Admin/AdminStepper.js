import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import Step1 from './Step1';
import Step2 from './Step2';
import { AuthButton } from 'components/Auth';

const useStyles = makeStyles(theme => ({
  completed: {
    display: 'inline-block',
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  buttonStyle: {
    marginRight: theme.spacing(1)
  }
}));

function getSteps() {
  return ['기본정보 기입하기', '상세정보 기입하기'];
}

function getStepContent(step, handleChange, handleChangeFile, form) {
  switch (step) {
    case 0:
      return <Step1 handleChange={handleChange} form={form}/>;
    case 1:
      return <Step2 handleChange={handleChange} form={form} handleChangeFile={handleChangeFile} />;
    default:
      return 'Unknown step';
  }
}

export default function AdminStepper({handleChange, handleAdminRegister, handleChangeFile, form}) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState({});
  const steps = getSteps();

  const totalSteps = () => {
    return steps.length;
  };

  const completedSteps = () => {
    return Object.keys(completed).length;
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed,
          // find the first step that has been completed
          steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleStep = step => () => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = completed;
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
    handleNext();
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };

  return (
    <div>
      <Stepper nonLinear activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepButton onClick={handleStep(index)} completed={completed[index]}>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <div>
        {allStepsCompleted() ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed - you&apos;re finished
            </Typography>
            <AuthButton onClick={handleAdminRegister}>관리자 신청하기</AuthButton>
          </div>
        ) : (
          <div>
            <Typography className={classes.instructions}>{getStepContent(activeStep, handleChange, handleChangeFile, form)}</Typography>
            <div>
              <Button disabled={activeStep === 0} onClick={handleBack} className={classes.buttonStyle}>
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                className={classes.buttonStyle}
              >
                Next
              </Button>
              {activeStep !== steps.length &&
                (completed[activeStep] ? (
                  <Typography variant="caption" className={classes.completed}>
                    Step {activeStep + 1} already completed
                  </Typography>
                ) : (
                  <Button variant="contained" color="primary" onClick={handleComplete} className={classes.buttonStyle}>
                    {completedSteps() === totalSteps() - 1 ? 'Finish' : 'Complete'}
                  </Button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
