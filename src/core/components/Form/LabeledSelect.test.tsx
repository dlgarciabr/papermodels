import React from 'react';
import { render } from 'test/utils';
import { LabeledSelect, LabeledSelectProps } from './LabeledSelect';
import { vi } from 'vitest';

vi.mock('formik', () => ({
  useField: vi.fn().mockReturnValue([{ value: '', onChange: vi.fn() }, {}]),
  useFormikContext: vi.fn().mockReturnValue({ isSubmitting: false }),
  ErrorMessage: vi.fn()
}));

const items = [
  { value: '1', label: 'One' },
  { value: '2', label: 'Two' },
  { value: '3', label: 'Three' }
];

const outerProps = {
  className: 'custom-class',
  'data-testid': 'custom-testid'
};

const setup = (props?: Partial<LabeledSelectProps>) => {
  return render(
    <LabeledSelect
      name='select'
      label='Select Label'
      items={items}
      outerProps={outerProps}
      placeholder='Select an option'
      {...props}
    />
  );
};

describe('LabeledSelect', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should render a select element with options and a label', () => {
    const { getByLabelText, getByText } = setup();
    const select = getByLabelText('Select Label');
    const optionOne = getByText('One');
    const optionTwo = getByText('Two');
    const optionThree = getByText('Three');
    const selectPlaceholder = getByText('Select an option');

    expect(select).toBeInTheDocument();
    expect(optionOne).toBeInTheDocument();
    expect(optionTwo).toBeInTheDocument();
    expect(optionThree).toBeInTheDocument();
    expect(selectPlaceholder).toBeInTheDocument();
  });
});
