import React, { useState } from 'react';
import { Card, Button, Typography, Space, Row, Col, Table, Tag, Statistic, Tooltip } from 'antd';
import { TrophyOutlined, FrownOutlined, SyncOutlined, SmileOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';

const { Title, Text } = Typography;

type Choice = 'Kéo' | 'Búa' | 'Bao';
type Result = 'Thắng' | 'Hòa' | 'Thua';

interface HistoryRecord {
	key: string;
	round: number;
	playerChoice: Choice;
	computerChoice: Choice;
	result: Result;
}

const choices: { value: Choice; emoji: string }[] = [
	{ value: 'Kéo', emoji: '✌️' },
	{ value: 'Búa', emoji: '✊' },
	{ value: 'Bao', emoji: '✋' },
];

const determineResult = (player: Choice, computer: Choice): Result => {
	if (player === computer) return 'Hòa';
	if (
		(player === 'Kéo' && computer === 'Bao') ||
		(player === 'Búa' && computer === 'Kéo') ||
		(player === 'Bao' && computer === 'Búa')
	) {
		return 'Thắng';
	}
	return 'Thua';
};

const RockPaperScissors: React.FC = () => {
	const [history, setHistory] = useState<HistoryRecord[]>([]);
	const [round, setRound] = useState(1);
	const [score, setScore] = useState({ player: 0, computer: 0, draws: 0 });
	const [isAnimating, setIsAnimating] = useState(false);
	const [lastResult, setLastResult] = useState<{
		playerChoice: Choice;
		computerChoice: Choice;
		result: Result;
		playerEmoji: string;
		computerEmoji: string;
	} | null>(null);

	const playRound = (playerChoice: Choice) => {
		if (isAnimating) return;

		setIsAnimating(true);
		setTimeout(() => {
			const computerOption = choices[Math.floor(Math.random() * choices.length)];
			const computerChoice = computerOption.value;
			const computerEmoji = computerOption.emoji;
			const playerEmoji = choices.find(c => c.value === playerChoice)?.emoji || '';

			const result = determineResult(playerChoice, computerChoice);

			const newRecord: HistoryRecord = {
				key: `${round}`,
				round,
				playerChoice,
				computerChoice,
				result,
			};

			setLastResult({ playerChoice, computerChoice, result, playerEmoji, computerEmoji });
			setHistory([newRecord, ...history]);
			setRound(round + 1);

			setScore(prev => ({
				player: result === 'Thắng' ? prev.player + 1 : prev.player,
				computer: result === 'Thua' ? prev.computer + 1 : prev.computer,
				draws: result === 'Hòa' ? prev.draws + 1 : prev.draws,
			}));

			setIsAnimating(false);
		}, 300);
	};

	const resetGame = () => {
		setHistory([]);
		setRound(1);
		setScore({ player: 0, computer: 0, draws: 0 });
		setLastResult(null);
	};

	const columns = [
		{
			title: 'Ván',
			dataIndex: 'round',
			key: 'round',
			align: 'center' as const,
			render: (text: number) => <Text strong>#{text}</Text>
		},
		{
			title: 'Bạn',
			dataIndex: 'playerChoice',
			key: 'playerChoice',
			align: 'center' as const,
			render: (text: string) => {
				const emoji = choices.find(c => c.value === text)?.emoji;
				return <Tag color="blue">{emoji} {text}</Tag>;
			}
		},
		{
			title: 'Máy tính',
			dataIndex: 'computerChoice',
			key: 'computerChoice',
			align: 'center' as const,
			render: (text: string) => {
				const emoji = choices.find(c => c.value === text)?.emoji;
				return <Tag color="volcano">{emoji} {text}</Tag>;
			}
		},
		{
			title: 'Kết quả',
			dataIndex: 'result',
			key: 'result',
			align: 'center' as const,
			render: (text: Result) => {
				if (text === 'Thắng') return <Tag color="success" icon={<TrophyOutlined />}>Thắng</Tag>;
				if (text === 'Thua') return <Tag color="error" icon={<FrownOutlined />}>Thua</Tag>;
				return <Tag color="default" icon={<SyncOutlined />}>Hòa</Tag>;
			},
		},
	];

	return (
		<PageContainer title="Trò chơi Oẳn Tù Tì">
			<Row gutter={[24, 24]}>
				<Col xs={24} lg={14}>
					<Space direction="vertical" style={{ width: '100%' }} size="large">
						<Card title="Chọn kéo búa bao">
							<Row justify="center" gutter={[16, 16]}>
								{choices.map((choice) => (
									<Col key={choice.value}>
										<Tooltip title={`Chọn ${choice.value}`}>
											<Button
												type="primary"
												size="large"
												onClick={() => playRound(choice.value)}
												disabled={isAnimating}
											>
												{choice.emoji} {choice.value}
											</Button>
										</Tooltip>
									</Col>
								))}
							</Row>
						</Card>

						<Card title="Kết quả">
							{!lastResult ? (
								<Row justify="center">
									<Space direction="vertical" align="center">
										<SmileOutlined style={{ fontSize: 32 }} />
										<Text type="secondary">Hãy đưa ra lựa chọn đầu tiên!</Text>
									</Space>
								</Row>
							) : (
								<Space direction="vertical" align="center" style={{ width: '100%' }} size="large">
									<Title level={3} type={lastResult.result === 'Thắng' ? 'success' : lastResult.result === 'Thua' ? 'danger' : 'warning'}>
										{lastResult.result === 'Thắng' ? '🎉 BẠN ĐÃ THẮNG!' : lastResult.result === 'Thua' ? 'Gàaaaaa 😏' : 'Hòa 😒'}
									</Title>

									<Row align="middle" justify="center" style={{ width: '100%' }}>
										<Col span={10} style={{ textAlign: 'center' }}>
											<Space direction="vertical" align="center" size="small">
												<Text strong>BẠN</Text>
												<span style={{ fontSize: 64, lineHeight: 1 }}>{lastResult.playerEmoji}</span>
												<Tag color="geekblue" style={{ margin: 0 }}>{lastResult.playerChoice}</Tag>
											</Space>
										</Col>
										<Col span={4} style={{ textAlign: 'center' }}>
											<Text type="secondary" strong style={{ fontSize: 20 }}>VS</Text>
										</Col>
										<Col span={10} style={{ textAlign: 'center' }}>
											<Space direction="vertical" align="center" size="small">
												<Text strong>MÁY TÍNH</Text>
												<span style={{ fontSize: 64, lineHeight: 1 }}>{lastResult.computerEmoji}</span>
												<Tag color="volcano" style={{ margin: 0 }}>{lastResult.computerChoice}</Tag>
											</Space>
										</Col>
									</Row>
								</Space>
							)}
						</Card>
					</Space>
				</Col>

				<Col xs={24} lg={10}>
					<Space direction="vertical" style={{ width: '100%' }} size="large">
						<Card>
							<Row gutter={16} align="middle" justify="center" style={{ textAlign: 'center' }}>
								<Col span={8}>
									<Statistic title="Thắng" value={score.player} prefix={<TrophyOutlined />} valueStyle={{ color: '#52c41a' }} />
								</Col>
								<Col span={8}>
									<Statistic title="Hòa" value={score.draws} prefix={<SyncOutlined />} />
								</Col>
								<Col span={8}>
									<Statistic title="Thua" value={score.computer} prefix={<FrownOutlined />} valueStyle={{ color: '#f5222d' }} />
								</Col>
							</Row>
						</Card>

						<Card
							title="Lịch sử đấu"
							extra={<Button type="primary" shape="circle" icon={<ReloadOutlined />} onClick={resetGame} disabled={history.length === 0} />}
						>
							<Table
								columns={columns}
								dataSource={history}
								pagination={{ pageSize: 5 }}
								size="small"
							/>
						</Card>
					</Space>
				</Col>
			</Row>
		</PageContainer>
	);
};

export default RockPaperScissors;
