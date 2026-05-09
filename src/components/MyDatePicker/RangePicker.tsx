import { DatePicker } from 'antd';
import locale from 'antd/es/date-picker/locale/vi_VN';
import type { RangePickerProps } from 'antd/es/date-picker/generatePicker';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const MyDateRangePicker = (
	props: Omit<RangePickerProps<Dayjs>, 'onChange'> & {
		/**
		 * Format hiển thị, mặc định: DD/MM/YYYY
		 */
		format?: string;
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
		onChange?: (arg: [string, string] | null) => any;
	},
) => {
	const format = props?.format ?? 'DD/MM/YYYY';
	const { saveFormat, disabledDate, showTime, allowClear, disabled } = props;

	const handleChange = (value: [Dayjs, Dayjs] | null) => {
		if (value) {
			const nextValue = saveFormat
				? value.map((item) => item.format(props?.saveFormat))
				: value.map((item) => item.toISOString());
			props.onChange?.(nextValue as [string, string]);
		} else {
			props.onChange?.(null);
		}
	};

	let objDayjs: any = undefined;
	if (props.value && Array.isArray(props.value) && props.value.every((item) => typeof item === 'string')) {
		objDayjs = props.value.map((item) => {
			return dayjs(item, saveFormat);
		});
	} else objDayjs = props?.value;

	return (
		<DatePicker.RangePicker
			style={{ width: '100%' }}
			{...props}
			format={format}
			locale={locale}
			value={objDayjs}
			onChange={handleChange as any}
			disabledDate={disabledDate}
			showTime={showTime as any}
			allowClear={allowClear}
			disabled={disabled}
		/>
	);
};

export default MyDateRangePicker;
