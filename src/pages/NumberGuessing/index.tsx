import React, { useState, useEffect } from 'react';
import { Card, InputNumber, Button, Typography, Space, Alert } from 'antd';

const { Title, Text } = Typography;

const NumberGuessing: React.FC = () => {
    const [targetNumber, setTargetNumber] = useState<number>(0);
    const [attempts, setAttempts] = useState<number>(10);
    const [guess, setGuess] = useState<number | null>(null);
    const [statusText, setStatusText] = useState<string>('');
    const [isGameOver, setIsGameOver] = useState<boolean>(false);
    const [history, setHistory] = useState<number[]>([]);

    const initGame = () => {
        setTargetNumber(Math.floor(Math.random() * 100) + 1);
        setAttempts(10);
        setGuess(null);
        setStatusText('');
        setIsGameOver(false);
        setHistory([]);
    };

    useEffect(() => {
        initGame();
    }, []);

    const handleGuess = () => {
        if (guess === null) {
            return;
        }

        const newAttempts = attempts - 1;
        setAttempts(newAttempts);
        setHistory([...history, guess]);

        if (guess === targetNumber) {
            setStatusText('Chúc mừng! Bạn đã đoán đúng!');
            setIsGameOver(true);
            return;
        }

        if (newAttempts === 0) {
            setStatusText(`Bạn đã hết lượt! Số đúng là ${targetNumber}.`);
            setIsGameOver(true);
            return;
        }

        if (guess < targetNumber) {
            setStatusText('Bạn đoán quá thấp!');
        } else {
            setStatusText('Bạn đoán quá cao!');
        }
    };

    return (
        <Card style={{ margin: 24 }}>
            <Title level={2}>Bài 1: Đoán số ngẫu nhiên</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Text>Hệ thống đã sinh ra một số ngẫu nhiên từ 1 đến 100.</Text>
                <Text strong>Số lượt còn lại: {attempts}</Text>

                {statusText && (
                    <Alert
                        message={statusText}
                        type={isGameOver ? (statusText.includes('Chúc mừng') ? 'success' : 'error') : 'info'}
                        showIcon
                    />
                )}

                <Space>
                    <InputNumber
                        min={1}
                        max={100}
                        value={guess}
                        onChange={(value) => setGuess(value)}
                        disabled={isGameOver}
                        placeholder="Nhập số dự đoán"
                        style={{ width: 150 }}
                        onPressEnter={handleGuess}
                    />
                    <Button type="primary" onClick={handleGuess} disabled={isGameOver || guess === null}>
                        Đoán
                    </Button>
                    <Button onClick={initGame}>Chơi lại</Button>
                </Space>

                {history.length > 0 && (
                    <Space direction="vertical">
                        <Text strong>Lịch sử đoán:</Text>
                        <Space wrap>
                            {history.map((h, i) => (
                                <Text key={i} code>{h}</Text>
                            ))}
                        </Space>
                    </Space>
                )}
            </Space>
        </Card>
    );
};

export default NumberGuessing;
