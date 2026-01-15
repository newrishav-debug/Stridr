/**
 * File: src/components/SimpleLineChart.tsx
 * Purpose: Lightweight line chart component for step trends visualization.
 * Created: 2026-01-14
 * Author: AI Assistant
 *
 * Modification History:
 * 2026-01-14: Initial creation using react-native-svg.
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';

interface DataPoint {
    label: string;
    value: number;
}

interface SimpleLineChartProps {
    data: DataPoint[];
    height?: number;
    lineColor?: string;
    fillColor?: string;
    labelColor?: string;
    gridColor?: string;
    showDots?: boolean;
    showLabels?: boolean;
    showValues?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
    data,
    height = 150,
    lineColor = '#3B82F6',
    fillColor = 'rgba(59, 130, 246, 0.1)',
    labelColor = '#6B7280',
    gridColor = '#E5E7EB',
    showDots = true,
    showLabels = true,
    showValues = false,
}) => {
    const width = SCREEN_WIDTH - 72; // Account for padding
    const paddingTop = showValues ? 24 : 12;
    const paddingBottom = showLabels ? 24 : 12;
    const paddingHorizontal = 12;
    const chartHeight = height - paddingTop - paddingBottom;
    const chartWidth = width - paddingHorizontal * 2;

    if (data.length === 0) {
        return (
            <View style={[styles.container, { height }]}>
                <Text style={styles.emptyText}>No data available</Text>
            </View>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    const minValue = 0;
    const range = maxValue - minValue;

    // Calculate points
    const points = data.map((d, i) => ({
        x: paddingHorizontal + (i / (data.length - 1 || 1)) * chartWidth,
        y: paddingTop + chartHeight - ((d.value - minValue) / range) * chartHeight,
        label: d.label,
        value: d.value,
    }));

    // Build SVG path for line
    const pathData = points.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`;
        return `${acc} L ${point.x} ${point.y}`;
    }, '');

    // Build fill path (closed polygon)
    const fillPathData = points.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x} ${paddingTop + chartHeight} L ${point.x} ${point.y}`;
        return `${acc} L ${point.x} ${point.y}`;
    }, '') + ` L ${points[points.length - 1]?.x || 0} ${paddingTop + chartHeight} Z`;

    return (
        <View style={[styles.container, { height }]}>
            <Svg width={width} height={height}>
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                    <Line
                        key={i}
                        x1={paddingHorizontal}
                        y1={paddingTop + chartHeight * (1 - ratio)}
                        x2={width - paddingHorizontal}
                        y2={paddingTop + chartHeight * (1 - ratio)}
                        stroke={gridColor}
                        strokeWidth={0.5}
                        strokeDasharray="4,4"
                    />
                ))}

                {/* Fill area under curve */}
                <Path d={fillPathData} fill={fillColor} />

                {/* Line */}
                <Path d={pathData} stroke={lineColor} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

                {/* Dots */}
                {showDots && points.map((point, i) => (
                    <Circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r={4}
                        fill="white"
                        stroke={lineColor}
                        strokeWidth={2}
                    />
                ))}

                {/* Labels */}
                {showLabels && points.map((point, i) => (
                    <SvgText
                        key={`label-${i}`}
                        x={point.x}
                        y={height - 6}
                        fontSize={10}
                        fill={labelColor}
                        textAnchor="middle"
                    >
                        {point.label}
                    </SvgText>
                ))}

                {/* Values on top of dots */}
                {showValues && points.map((point, i) => (
                    <SvgText
                        key={`value-${i}`}
                        x={point.x}
                        y={point.y - 10}
                        fontSize={9}
                        fill={labelColor}
                        textAnchor="middle"
                        fontWeight="600"
                    >
                        {point.value >= 1000 ? `${(point.value / 1000).toFixed(1)}k` : point.value}
                    </SvgText>
                ))}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontStyle: 'italic',
    },
});

export default SimpleLineChart;
