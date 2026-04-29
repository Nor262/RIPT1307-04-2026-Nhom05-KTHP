import { message } from 'antd';
import type { Destination, Itinerary } from '../../pages/TravelPlanner/data';

const DESTINATION_KEY = 'TRAVEL_DESTINATIONS';
const ITINERARY_KEY = 'TRAVEL_ITINERARIES';

const defaultDestinations: Destination[] = [
	{
		id: 'd1',
		name: 'Phú Quốc',
		description: 'Đảo ngọc với bãi biển cát trắng, nước trong xanh và hệ sinh thái san hô phong phú.',
		image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Bai-sao-phu-quoc-tuonglamphotos.jpg/500px-Bai-sao-phu-quoc-tuonglamphotos.jpg',
		location: 'Kiên Giang',
		type: 'beach',
		rating: 5,
		timeToVisit: 8,
		costs: { food: 500000, accommodation: 1200000, transport: 300000 },
	},
	{
		id: 'd2',
		name: 'Nha Trang',
		description: 'Thành phố biển nổi tiếng với vịnh đẹp, đảo hoang sơ và cuộc sống về đêm sôi động.',
		image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Nha_Trang%2C_Kh%C3%A1nh_H%C3%B2a.png/500px-Nha_Trang%2C_Kh%C3%A1nh_H%C3%B2a.png',
		location: 'Khánh Hòa',
		type: 'beach',
		rating: 4,
		timeToVisit: 6,
		costs: { food: 400000, accommodation: 800000, transport: 250000 },
	},
	{
		id: 'd3',
		name: 'Đà Nẵng',
		description: 'Thành phố đáng sống với bãi biển Mỹ Khê, cầu Rồng và ẩm thực đường phố tuyệt vời.',
		image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Dragon_Bridge%2C_Da_Nang_during_day_-_20230819_%28cropped%29.jpg/500px-Dragon_Bridge%2C_Da_Nang_during_day_-_20230819_%28cropped%29.jpg',
		location: 'Đà Nẵng',
		type: 'beach',
		rating: 5,
		timeToVisit: 6,
		costs: { food: 350000, accommodation: 700000, transport: 200000 },
	},
	{
		id: 'd4',
		name: 'Quy Nhơn',
		description: 'Vùng biển hoang sơ với Eo Gió, Kỳ Co và nền ẩm thực hải sản tươi ngon.',
		image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Skyline_of_Quy_Nhon.jpg/500px-Skyline_of_Quy_Nhon.jpg',
		location: 'Bình Định',
		type: 'beach',
		rating: 4,
		timeToVisit: 5,
		costs: { food: 300000, accommodation: 600000, transport: 200000 },
	},
	{
		id: 'd5',
		name: 'Sa Pa',
		description: 'Thị trấn trong sương với ruộng bậc thang, đỉnh Fansipan và văn hóa dân tộc đặc sắc.',
		image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Thacbac3.jpg/500px-Thacbac3.jpg',
		location: 'Lào Cai',
		type: 'mountain',
		rating: 5,
		timeToVisit: 8,
		costs: { food: 300000, accommodation: 500000, transport: 350000 },
	},
	{
		id: 'd6',
		name: 'Đà Lạt',
		description: 'Thành phố ngàn hoa với khí hậu mát mẻ, thác nước và vườn dâu tây.',
		image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Xuan_Huong_Lake_11.jpg/500px-Xuan_Huong_Lake_11.jpg',
		location: 'Lâm Đồng',
		type: 'mountain',
		rating: 5,
		timeToVisit: 6,
		costs: { food: 250000, accommodation: 450000, transport: 200000 },
	},
	{
		id: 'd7',
		name: 'Hà Giang',
		description: 'Cao nguyên đá hùng vĩ với đèo Mã Pí Lèng, sông Nho Quế và bản làng dân tộc.',
		image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/%C4%90%C3%A8o_M%C3%A3_P%C3%AC_L%C3%A8ng.jpg/500px-%C4%90%C3%A8o_M%C3%A3_P%C3%AC_L%C3%A8ng.jpg',
		location: 'Hà Giang',
		type: 'mountain',
		rating: 5,
		timeToVisit: 10,
		costs: { food: 200000, accommodation: 350000, transport: 400000 },
	},
	{
		id: 'd8',
		name: 'Tam Đảo',
		description: 'Khu nghỉ dưỡng gần Hà Nội với rừng nguyên sinh, thác bạc và khí hậu mát lạnh.',
		image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tam_Dao_peaks.jpg/500px-Tam_Dao_peaks.jpg',
		location: 'Vĩnh Phúc',
		type: 'mountain',
		rating: 3,
		timeToVisit: 4,
		costs: { food: 200000, accommodation: 400000, transport: 150000 },
	},
	{
		id: 'd9',
		name: 'Hà Nội',
		description: 'Thủ đô ngàn năm văn hiến với phố cổ, hồ Hoàn Kiếm và ẩm thực đường phố.',
		image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Hanoi_skyline_with_Ba_Vi_Mountain.jpg/500px-Hanoi_skyline_with_Ba_Vi_Mountain.jpg',
		location: 'Hà Nội',
		type: 'city',
		rating: 4,
		timeToVisit: 8,
		costs: { food: 300000, accommodation: 600000, transport: 150000 },
	},
	{
		id: 'd10',
		name: 'TP. Hồ Chí Minh',
		description: 'Thành phố năng động nhất Việt Nam với nhà thờ Đức Bà, chợ Bến Thành và ẩm thực đa dạng.',
		image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Ho_Chi_Minh_City_panorama_2019_%28cropped2%29.jpg/500px-Ho_Chi_Minh_City_panorama_2019_%28cropped2%29.jpg',
		location: 'TP.HCM',
		type: 'city',
		rating: 4,
		timeToVisit: 8,
		costs: { food: 350000, accommodation: 700000, transport: 200000 },
	},
	{
		id: 'd11',
		name: 'Huế',
		description: 'Cố đô với Đại Nội, lăng tẩm, sông Hương và nền ẩm thực cung đình tinh tế.',
		image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Th%C3%A0nh_ph%E1%BB%91_Hu%E1%BA%BF_nh%C3%ACn_t%E1%BB%AB_tr%C3%AAn_cao_%282%29.jpg/500px-Th%C3%A0nh_ph%E1%BB%91_Hu%E1%BA%BF_nh%C3%ACn_t%E1%BB%AB_tr%C3%AAn_cao_%282%29.jpg',
		location: 'Thừa Thiên Huế',
		type: 'city',
		rating: 4,
		timeToVisit: 6,
		costs: { food: 250000, accommodation: 500000, transport: 150000 },
	},
	{
		id: 'd12',
		name: 'Hội An',
		description: 'Phố cổ di sản UNESCO với đèn lồng rực rỡ, may đo nổi tiếng và ẩm thực đặc sắc.',
		image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/H%E1%BB%99i_An%2C_Ancient_Town%2C_2020-01_CN-10.jpg/500px-H%E1%BB%99i_An%2C_Ancient_Town%2C_2020-01_CN-10.jpg',
		location: 'Quảng Nam',
		type: 'city',
		rating: 5,
		timeToVisit: 6,
		costs: { food: 300000, accommodation: 550000, transport: 100000 },
	}
];

export const getDestinations = async (): Promise<{ data: Destination[]; success: boolean; total: number }> => {
  try {
    let data = localStorage.getItem(DESTINATION_KEY);
    if (!data) {
      localStorage.setItem(DESTINATION_KEY, JSON.stringify(defaultDestinations));
      data = JSON.stringify(defaultDestinations);
    }
    let parsedData: Destination[];
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = [];
    }

    if (!parsedData.some(d => d.id === 'd12')) {
      localStorage.setItem(DESTINATION_KEY, JSON.stringify(defaultDestinations));
      parsedData = defaultDestinations;
    }

    return { data: parsedData, success: true, total: parsedData.length };
  } catch (error) {
    message.error('Lỗi khi tải danh sách điểm đến');
    return { data: [], success: false, total: 0 };
  }
};

export const addDestination = async (data: Partial<Destination>): Promise<any> => {
  try {
    const list = await getDestinations();
    const newDest: Destination = {
      ...data,
      id: Date.now().toString(),
    } as Destination;
    const newData = [newDest, ...list.data];
    localStorage.setItem(DESTINATION_KEY, JSON.stringify(newData));
    message.success('Thêm điểm đến thành công');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export const updateDestination = async (id: string, data: Partial<Destination>): Promise<any> => {
  try {
    const list = (await getDestinations()).data;
    const index = list.findIndex(d => d.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...data };
      localStorage.setItem(DESTINATION_KEY, JSON.stringify(list));
      message.success('Cập nhật điểm đến thành công');
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    return { success: false };
  }
};

export const removeDestination = async (id: string): Promise<any> => {
  try {
    const list = (await getDestinations()).data;
    const newData = list.filter(d => d.id !== id);
    localStorage.setItem(DESTINATION_KEY, JSON.stringify(newData));
    message.success('Đã xóa điểm đến');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

const defaultItineraries: Itinerary[] = [
	{
		id: 'it1',
		title: 'Du lịch biển Phú Quốc 3 ngày',
		budget: 8000000,
		days: [
			{ id: 'day1-1', dayNumber: 1, destinations: defaultDestinations.filter(d => ['d1'].includes(d.id)) },
			{ id: 'day1-2', dayNumber: 2, destinations: defaultDestinations.filter(d => ['d1', 'd4'].includes(d.id)) },
			{ id: 'day1-3', dayNumber: 3, destinations: defaultDestinations.filter(d => ['d1'].includes(d.id)) },
		],
		createdAt: new Date('2026-01-15T08:00:00.000Z').getTime(),
	},
	{
		id: 'it2',
		title: 'Khám phá Tây Bắc 4 ngày',
		budget: 6000000,
		days: [
			{ id: 'day2-1', dayNumber: 1, destinations: defaultDestinations.filter(d => ['d9'].includes(d.id)) },
			{ id: 'day2-2', dayNumber: 2, destinations: defaultDestinations.filter(d => ['d5'].includes(d.id)) },
			{ id: 'day2-3', dayNumber: 3, destinations: defaultDestinations.filter(d => ['d7'].includes(d.id)) },
			{ id: 'day2-4', dayNumber: 4, destinations: defaultDestinations.filter(d => ['d5', 'd9'].includes(d.id)) },
		],
		createdAt: new Date('2026-02-10T08:00:00.000Z').getTime(),
	},
	{
		id: 'it3',
		title: 'Miền Trung 3 ngày',
		budget: 5000000,
		days: [
			{ id: 'day3-1', dayNumber: 1, destinations: defaultDestinations.filter(d => ['d3'].includes(d.id)) },
			{ id: 'day3-2', dayNumber: 2, destinations: defaultDestinations.filter(d => ['d12', 'd11'].includes(d.id)) },
			{ id: 'day3-3', dayNumber: 3, destinations: defaultDestinations.filter(d => ['d3'].includes(d.id)) },
		],
		createdAt: new Date('2026-03-20T08:00:00.000Z').getTime(),
	},
];

export const getItineraries = async (): Promise<{ data: Itinerary[]; success: boolean; total: number }> => {
  try {
    let data = localStorage.getItem(ITINERARY_KEY);
    if (!data) {
      localStorage.setItem(ITINERARY_KEY, JSON.stringify(defaultItineraries));
      data = JSON.stringify(defaultItineraries);
    }
    let parsedData: Itinerary[];
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = [];
    }
    
    if (!parsedData.some(i => i.id === 'it1' || i.title === 'Miền Trung 3 ngày')) {
      localStorage.setItem(ITINERARY_KEY, JSON.stringify(defaultItineraries));
      parsedData = defaultItineraries;
    }

    return { data: parsedData, success: true, total: parsedData.length };
  } catch (error) {
    message.error('Lỗi khi tải danh sách lịch trình');
    return { data: [], success: false, total: 0 };
  }
};

export const saveItinerary = async (data: Itinerary): Promise<any> => {
  try {
    const list = (await getItineraries()).data;
    const index = list.findIndex(i => i.id === data.id);
    if (index >= 0) {
      list[index] = data;
    } else {
      list.unshift(data);
    }
    localStorage.setItem(ITINERARY_KEY, JSON.stringify(list));
    message.success('Lưu lịch trình thành công');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export const removeItinerary = async (id: string): Promise<any> => {
  try {
    const list = (await getItineraries()).data;
    const newData = list.filter(d => d.id !== id);
    localStorage.setItem(ITINERARY_KEY, JSON.stringify(newData));
    message.success('Đã xóa lịch trình');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
