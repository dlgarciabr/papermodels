/* istanbul ignore file -- @preserve */
// TODO review test to improve coverage
import { forwardRef, PropsWithoutRef } from 'react';
import { useField, useFormikContext, ErrorMessage } from 'formik';

export interface LabeledSelectProps extends PropsWithoutRef<JSX.IntrinsicElements['select']> {
  /** Field name. */
  name: string;
  /** Field label. */
  label: string;
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements['div']>;
  items: { value: any; label: string }[];
}

export const LabeledSelect = forwardRef<HTMLSelectElement, LabeledSelectProps>(
  ({ name, label, items, outerProps, placeholder, ...props }, ref) => {
    const [input] = useField(name);
    const { isSubmitting } = useFormikContext();

    return (
      <div {...outerProps}>
        <label>
          {label}
          <select {...input} disabled={isSubmitting} {...props} ref={ref}>
            <option>{placeholder}</option>
            {items.map((item) => (
              <option key={Math.random().toString(36).substring(2, 15)} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <ErrorMessage name={name}>
          {(msg) => (
            <div role='alert' style={{ color: 'red' }}>
              {msg}
            </div>
          )}
        </ErrorMessage>

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
