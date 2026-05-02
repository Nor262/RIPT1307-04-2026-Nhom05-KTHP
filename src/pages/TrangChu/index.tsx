import { Card } from 'antd';
import './components/style.less';
import { unitName } from '@/services/base/constant';
import { useModel } from 'umi';

const TrangChu = () => {
	return (
		<Card bodyStyle={{ height: '100%' }}>
			<div className='home-welcome'>
				<h1 className='title'>Bài tập lớn Web 2026</h1>
				<h2 className='sub-title'>B24DCCC229</h2>
			</div>
		</Card>
	);
};

export default TrangChu;
