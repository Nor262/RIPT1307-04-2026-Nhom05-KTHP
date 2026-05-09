import { DatePicker } from 'antd';
import locale from 'antd/es/date-picker/locale/vi_VN';
import type { PickerProps } from 'antd/es/date-picker/generatePicker';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const MyDatePicker = (
  props: Omit<PickerProps<Dayjs>, 'onChange'> & {
    /**
     * Format hiển thị, mặc định: DD/MM/YYYY
     */
    format?: string;
    pickerStyle?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year' | undefined;
    showTime?:
      | boolean
      | {
          format?: string;
          showNow?: boolean;
          showHour?: boolean;
          showMinute?: boolean;
          showSecond?: boolean;
          use12Hours?: boolean;
          hourStep?: number;
          minuteStep?: number;
          secondStep?: number;
        };
    allowClear?: boolean;
    disabled?: boolean;

    /**
     * Format lưu lại, mặc định: ISOString
     */
    saveFormat?: string;
    disabledDate?: (cur: any) => any;
    onChange?: (arg: string | null) => any;
  },
) => {
  const format = props?.format ?? 'DD/MM/YYYY';
  const { saveFormat, pickerStyle, disabledDate, showTime, allowClear, disabled } = props;

  const handleChange = (value: Dayjs | null) => {
    if (props.onChange)
      if (value)
        props.onChange(saveFormat ? value?.format(props?.saveFormat) : value.toISOString());
      else props.onChange(null);
  };

  let objDayjs: any = undefined;
  if (props.value && typeof props.value == 'string') objDayjs = dayjs(props.value, saveFormat);
  else objDayjs = props?.value;

  return (
    <DatePicker
      style={{ width: '100%' }}
      {...props}
      format={format}
      picker={pickerStyle}
      locale={locale}
      value={objDayjs}
      onChange={handleChange}
      disabledDate={disabledDate}
      showTime={showTime}
      allowClear={allowClear}
      disabled={disabled}
    />
  );
};

export default MyDatePicker;
