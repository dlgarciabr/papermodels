import { Button, Card, CardContent, Grid, IconButton, TextField, Typography } from '@mui/material';
import { memo, useEffect, useState } from 'react';
import { MdAddCircle, MdRemoveCircle } from 'react-icons/md';

import { IntegrationSelector } from 'types';
import { ISelectorProps } from '../Selector/types';

export const Selector = ({
  label,
  jsonSelectors,
  leftKey,
  rightKey,
  onChangeSelectors,
  hasError = false,
  leftXS = 2,
  rightXS = 10
}: ISelectorProps) => {
  const [selectors, setSelectors] = useState<IntegrationSelector[]>([]);
  const [showError, setShowError] = useState<boolean>(false);

  useEffect(() => {
    if (jsonSelectors) {
      setSelectors(JSON.parse(jsonSelectors) as IntegrationSelector[]);
    } else {
      setSelectors([]);
    }
  }, [jsonSelectors]);

  const createEmptyLine = () => {
    setSelectors([...selectors, { type: '', value: '' } as any]);
    setShowError(false);
  };

  const removeLine = (index: number) => {
    const selectorsToModify = [...selectors];
    selectorsToModify.splice(index, 1);
    setSelectors([...selectorsToModify]);
    onChangeSelectors(JSON.stringify(selectorsToModify));
    setShowError(false);
  };

  const handleChangeSelector = (index: number, key: string, value: string) => {
    const selectorsToModify = [...selectors];
    selectorsToModify[index]![key] = value;
    setSelectors([...selectorsToModify]);
    onChangeSelectors(JSON.stringify(selectorsToModify));
    setShowError(false);
  };

  useEffect(() => {
    setShowError(hasError);
  }, [hasError]);

  const renderLine = (selector: IntegrationSelector, index: number) => (
    <Grid key={index} container spacing={0.2} rowSpacing={1} className='marginBotton5px'>
      <Grid item xs={leftXS}>
        <TextField
          fullWidth
          label={leftKey}
          value={selector[leftKey]}
          size='small'
          onChange={(e) => handleChangeSelector(index, leftKey, e.target.value)}
        />
      </Grid>
      <Grid item container xs={rightXS} alignItems='center'>
        <Grid item xs={9}>
          <TextField
            fullWidth
            label={rightKey}
            value={selector[rightKey]}
            size='small'
            onChange={(e) => handleChangeSelector(index, rightKey, e.target.value)}
          />
        </Grid>
        <Grid item xs={3} minWidth='57px'>
          <IconButton size='small' aria-label='delete' onClick={() => removeLine(index)}>
            <MdRemoveCircle fontSize='inherit' />
          </IconButton>
          {selectors.length === index + 1 && (
            <IconButton size='small' aria-label='add' onClick={() => createEmptyLine()}>
              <MdAddCircle />
            </IconButton>
          )}
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Card>
      <CardContent className={`selector-box ${showError ? 'selector-box--error' : ''}`}>
        <Typography variant='body2'>{label}</Typography>
        {selectors.length === 0 ? (
          <Grid container xs={12} justifyContent='center' alignItems='center' className='MuiGrid-container--empty'>
            <Grid item>
              <Button onClick={() => createEmptyLine()}>add new selector</Button>
            </Grid>
          </Grid>
        ) : (
          selectors.map((selector, index) => renderLine(selector, index))
        )}
      </CardContent>
    </Card>
  );
};

export default memo(Selector);
