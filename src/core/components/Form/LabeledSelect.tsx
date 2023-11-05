import { forwardRef, PropsWithoutRef } from 'react';
import { useField, useFormikContext, ErrorMessage } from 'formik';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export interface LabeledSelectProps extends PropsWithoutRef<JSX.IntrinsicElements['select']> {
  name: string;
  label: string;
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements['div']>;
  fullWidth?: boolean;
  items: { value: string | number; label: string }[];
}

export const LabeledSelect = forwardRef<HTMLSelectElement, LabeledSelectProps>(
  ({ name, label, items, outerProps, ...props }, ref) => {
    const [input, meta, helper] = useField(name);
    const { isSubmitting } = useFormikContext();
    const labelId = `select-label-${name}`;
    return (
      <div {...outerProps}>
        <FormControl fullWidth error={!!meta.error}>
          <InputLabel id={labelId}>{label}</InputLabel>
          <Select
            {...input}
            labelId={labelId}
            name={name}
            onChange={async (event) => {
              await helper.setValue(event.target.value.toString());
            }}
            disabled={isSubmitting}
            variant='outlined'
            color='primary'
            size='medium'
            ref={ref}
            fullWidth={props.fullWidth}
            id='demo-simple-select'>
            {items.map((item) => (
              <MenuItem key={Math.random().toString(36).substring(2, 15)} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div role='alert' className='form-error-message'>
          <ErrorMessage name={name}>{(msg) => msg}</ErrorMessage>
        </div>

        <style jsx>{`
          label {
            display: flex;
            flex-direction: column;
            align-items: start;
            font-size: 1rem;
          }
          select {
            font-size: 1rem;
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            border: 1px solid purple;
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    );
  }
);

export default LabeledSelect;
