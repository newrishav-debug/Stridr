/**
 * File: src/const/trails.ts
 * Purpose: Static data for all available walking trails.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import { Trail } from '../types';

// Classic Adventures (Americas & Asia) - REMOVED

// Incredible India Treks
export const INDIAN_TRAILS: Trail[] = [
    {
        id: 'roopkund-trek',
        name: 'Roopkund Trek',
        description: 'A trek to the mysterious Skeleton Lake at 16,000 ft in the Himalayas.',
        extendedDescription: 'Famous for the human skeletons found at the edge of the glacial lake, this trek offers a mix of deep virgin forests, gurgling brooks, breath-taking campsites, and miles of undulating meadows (Ali and Bedni Bugyal). The climb to 16,000 ft is challenging but rewarding.',
        totalDistanceMeters: 53000,
        color: '#3B82F6',
        difficulty: 'Hard',
        image: require('../../assets/roopkund_trek.png'),
        startCoordinate: { latitude: 30.26, longitude: 79.73 },
        endCoordinate: { latitude: 30.26, longitude: 79.73 },
        region: {
            latitude: 30.26,
            longitude: 79.73,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        },
        landmarks: [
            { id: 'rk1', name: 'Lohajung', distanceMeters: 0, description: 'Base camp village' },
            { id: 'rk2', name: 'Didna Village', distanceMeters: 8000, description: 'Traditional Himalayan village' },
            { id: 'rk3', name: 'Ali Bugyal', distanceMeters: 18000, description: 'Vast alpine meadows' },
            { id: 'rk3b', name: 'Bedni Bugyal', distanceMeters: 22000, description: 'Camping ground with views' },
            { id: 'rk4', name: 'Ghora Lotani', distanceMeters: 25000, description: 'Scenic campsite' },
            { id: 'rk4b', name: 'Patar Nachauni', distanceMeters: 30000, description: 'Green plateaus' },
            { id: 'rk4c', name: 'Kalu Vinayak', distanceMeters: 33000, description: 'Ganesha temple' },
            { id: 'rk5', name: 'Bhagwabasa', distanceMeters: 35000, description: 'Rocky terrain camp' },
            { id: 'rk6', name: 'Roopkund Lake', distanceMeters: 40000, description: 'The Skeleton Lake' },
            { id: 'rk7', name: 'Junargali', distanceMeters: 41000, description: 'Ridge above the lake' },
            { id: 'rk8', name: 'Wan Village', distanceMeters: 53000, description: 'End of trek' },
        ]
    },
    {
        id: 'chadar-trek',
        name: 'Chadar Trek',
        description: 'The Frozen River Trek on the Zanskar River in Ladakh.',
        extendedDescription: 'One of the most unique treks in the world, walking on the frozen glassy sheet of the Zanskar river. Temperatures drop to -30°C. Experience the dramatic gorge walls and the frozen Nerak waterfall.',
        totalDistanceMeters: 65000,
        color: '#0EA5E9',
        difficulty: 'Extreme',
        image: require('../../assets/chadar_trek.png'),
        startCoordinate: { latitude: 33.77, longitude: 76.84 },
        endCoordinate: { latitude: 33.77, longitude: 76.84 },
        region: {
            latitude: 33.77,
            longitude: 76.84,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
        },
        landmarks: [
            { id: 'ct1', name: 'Chilling', distanceMeters: 0, description: 'Start point' },
            { id: 'ct2', name: 'Tilad Sumdo', distanceMeters: 10000, description: 'First camp on ice' },
            { id: 'ct2b', name: 'Shingra Koma', distanceMeters: 20000, description: 'Scenic bend' },
            { id: 'ct3', name: 'Tibb Cave', distanceMeters: 35000, description: 'Natural shelter' },
            { id: 'ct4', name: 'Nerak Waterfall', distanceMeters: 45000, description: 'Iconic frozen waterfall' },
            { id: 'ct5', name: 'Lingshed', distanceMeters: 55000, description: 'Remote village' },
            { id: 'ct6', name: 'Chilling', distanceMeters: 65000, description: 'Return journey' },
        ]
    },
    {
        id: 'kedarkantha-trek',
        name: 'Kedarkantha Trek',
        description: 'Popular winter trek in Uttarakhand with a spectacular summit climb.',
        extendedDescription: 'Perfect for beginners, this trek offers a 360-degree view of famous mountain summits. The trail goes through Govind National Park, offering beautiful campsites like Juda Ka Talab amidst pine forests.',
        totalDistanceMeters: 20000,
        color: '#F59E0B',
        difficulty: 'Moderate',
        image: require('../../assets/kedarkantha_trek.png'),
        startCoordinate: { latitude: 31.02, longitude: 78.17 },
        endCoordinate: { latitude: 31.02, longitude: 78.17 },
        region: {
            latitude: 31.02,
            longitude: 78.17,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        },
        landmarks: [
            { id: 'kt1', name: 'Sankri', distanceMeters: 0, description: 'Base village' },
            { id: 'kt2', name: 'Juda Ka Talab', distanceMeters: 4000, description: 'Frozen lake campsite' },
            { id: 'kt3', name: 'Base Camp', distanceMeters: 8000, description: 'Below the summit' },
            { id: 'kt4', name: 'Kedarkantha Summit', distanceMeters: 10000, description: '3800m Peak' },
            { id: 'kt5', name: 'Hargaon', distanceMeters: 15000, description: 'Descent camp' },
            { id: 'kt6', name: 'Sankri', distanceMeters: 20000, description: 'Trek complete' },
        ]
    },
    {
        id: 'valley-of-flowers',
        name: 'Valley of Flowers',
        description: 'A UNESCO World Heritage site known for its endless meadows of alpine flowers.',
        extendedDescription: 'Legendary trek in global trekking circles. Visit during monsoon to see the valley carpeted with flowers like the Blue Poppy and Cobra Lily. Nearby is the Hemkund Sahib Gurudwara.',
        totalDistanceMeters: 38000,
        color: '#EC4899',
        difficulty: 'Moderate',
        image: require('../../assets/valley_of_flowers.png'),
        startCoordinate: { latitude: 30.73, longitude: 79.63 },
        endCoordinate: { latitude: 30.73, longitude: 79.63 },
        region: {
            latitude: 30.73,
            longitude: 79.63,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        },
        landmarks: [
            { id: 'vof1', name: 'Govindghat', distanceMeters: 0, description: 'Start of the trail' },
            { id: 'vof2', name: 'Ghangaria', distanceMeters: 14000, description: 'Base for the valley' },
            { id: 'vof3', name: 'Valley Entry', distanceMeters: 18000, description: 'Entrance to the park' },
            { id: 'vof4', name: 'Tipra Glacier', distanceMeters: 24000, description: 'End of the valley trail' },
            { id: 'vof5', name: 'Hemkund Sahib', distanceMeters: 30000, description: 'Optional spiritual climb' },
            { id: 'vof6', name: 'Govindghat', distanceMeters: 38000, description: 'Return journey' },
        ]
    },
    {
        id: 'hampta-pass',
        name: 'Hampta Pass Trek',
        description: 'Dramatic crossover trek from lush Kullu valley to arid Spiti valley.',
        extendedDescription: 'A trek of stark contrasts. Start in the green pine forests of Manali and cross the 14,000 ft pass to enter the barren, rugged landscape of Lahaul. Visit the stunning Chandratal lake.',
        totalDistanceMeters: 26000,
        color: '#10B981',
        difficulty: 'Moderate',
        image: require('../../assets/hampta_pass.png'),
        startCoordinate: { latitude: 32.24, longitude: 77.37 },
        endCoordinate: { latitude: 32.24, longitude: 77.37 },
        region: {
            latitude: 32.24,
            longitude: 77.37,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
        },
        landmarks: [
            { id: 'hp1', name: 'Jobra', distanceMeters: 0, description: 'Trailhead' },
            { id: 'hp2', name: 'Chika', distanceMeters: 4000, description: 'River campsite' },
            { id: 'hp3', name: 'Balu Ka Ghera', distanceMeters: 12000, description: 'Base of the pass' },
            { id: 'hp4', name: 'Hampta Pass', distanceMeters: 16000, description: 'The crossover point' },
            { id: 'hp5', name: 'Shea Goru', distanceMeters: 20000, description: 'Descent campsite' },
            { id: 'hp6', name: 'Chatru', distanceMeters: 26000, description: 'End point' },
        ]
    },
    {
        id: 'goechala-trek',
        name: 'Goechala Trek',
        description: 'Close-up views of the majestic Kanchenjunga peak in Sikkim.',
        extendedDescription: 'Offers grand views of big mountains. You see 14 big summits. The sunrise on the Kanchenjunga range is legendary. Trail passes through beautiful rhododendron forests of Dzongri.',
        totalDistanceMeters: 90000,
        color: '#8B5CF6',
        difficulty: 'Hard',
        image: require('../../assets/goechala_trek.png'),
        startCoordinate: { latitude: 27.57, longitude: 88.19 },
        endCoordinate: { latitude: 27.57, longitude: 88.19 },
        region: {
            latitude: 27.57,
            longitude: 88.19,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        },
        landmarks: [
            { id: 'gt1', name: 'Yuksom', distanceMeters: 0, description: 'Historical base' },
            { id: 'gt2', name: 'Sachen', distanceMeters: 8000, description: 'Forest walk' },
            { id: 'gt2b', name: 'Bakhim', distanceMeters: 12000, description: 'Steep ascent' },
            { id: 'gt3', name: 'Tshoka', distanceMeters: 16000, description: 'Tibetan settlement' },
            { id: 'gt3b', name: 'Phedang', distanceMeters: 21000, description: 'Forest clearing' },
            { id: 'gt4', name: 'Dzongri', distanceMeters: 25000, description: 'Viewpoint' },
            { id: 'gt4b', name: 'Dzongri Top', distanceMeters: 27000, description: 'Sunrise view' },
            { id: 'gt5', name: 'Thansing', distanceMeters: 35000, description: 'Meadows' },
            { id: 'gt5b', name: 'Lamuney', distanceMeters: 40000, description: 'Base camp' },
            { id: 'gt6', name: 'Goechala Viewpoint', distanceMeters: 45000, description: 'Kanchenjunga face-to-face' },
            { id: 'gt7', name: 'Yuksom', distanceMeters: 90000, description: 'Return journey' },
        ]
    },
    {
        id: 'markha-valley',
        name: 'Markha Valley Trek',
        description: 'A dive into Ladakhi culture and arid landscapes in Hemis National Park.',
        extendedDescription: 'Walk through "Little Tibet". Dry mountains, streams, and barley fields. Homestays in remote villages are a highlight. Cross the Kongmaru La pass at 17,000 ft.',
        totalDistanceMeters: 78000,
        color: '#D946EF',
        difficulty: 'Hard',
        image: require('../../assets/markha_valley.png'),
        startCoordinate: { latitude: 33.91, longitude: 77.34 },
        endCoordinate: { latitude: 33.91, longitude: 77.34 },
        region: {
            latitude: 33.91,
            longitude: 77.34,
            latitudeDelta: 0.3,
            longitudeDelta: 0.3,
        },
        landmarks: [
            { id: 'mv1', name: 'Chilling', distanceMeters: 0, description: 'Start' },
            { id: 'mv2', name: 'Skiu', distanceMeters: 15000, description: 'First village' },
            { id: 'mv2b', name: 'Sara', distanceMeters: 25000, description: 'River camp' },
            { id: 'mv3', name: 'Markha', distanceMeters: 40000, description: 'Major village' },
            { id: 'mv3b', name: 'Hankar', distanceMeters: 50000, description: 'Village with fort' },
            { id: 'mv4', name: 'Nimaling', distanceMeters: 60000, description: 'High plains' },
            { id: 'mv5', name: 'Kongmaru La', distanceMeters: 65000, description: 'High pass (5200m)' },
            { id: 'mv6', name: 'Shang Sumdo', distanceMeters: 78000, description: 'End point' },
        ]
    },
    {
        id: 'stok-kangri',
        name: 'Stok Kangri Trek',
        description: 'A serious expedition to climb a 6,153m trek-able summit in Ladakh.',
        extendedDescription: 'Often considered the highest trek-able summit in India. Requires acclimatization and physical fitness. The view from the top includes the Karakoram range and K2 on a clear day.',
        totalDistanceMeters: 40000,
        color: '#6366F1',
        difficulty: 'Extreme',
        image: require('../../assets/stok_kangri.png'),
        startCoordinate: { latitude: 33.98, longitude: 77.44 },
        endCoordinate: { latitude: 33.98, longitude: 77.44 },
        region: {
            latitude: 33.98,
            longitude: 77.44,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        },
        landmarks: [
            { id: 'sk1', name: 'Stok Village', distanceMeters: 0, description: 'Start' },
            { id: 'sk2', name: 'Chang Ma', distanceMeters: 6000, description: 'First camp' },
            { id: 'sk3', name: 'Mankorma', distanceMeters: 10000, description: 'Acclimatization' },
            { id: 'sk4', name: 'Base Camp', distanceMeters: 15000, description: 'Below the peak' },
            { id: 'sk5', name: 'Summit', distanceMeters: 20000, description: '6153m Top' },
            { id: 'sk6', name: 'Stok Village', distanceMeters: 40000, description: 'Return' },
        ]
    },
    {
        id: 'kumara_parvatha',
        name: 'Kumara Parvatha Trek',
        description: 'The toughest trek in Karnataka, offering varied terrain in the Western Ghats.',
        extendedDescription: 'A classic trek in the verdant Western Ghats. Passes through ancient forests, grasslands, and rocky faces. The Bhattara Mane is a famous pitstop. The peak offers views of Coorg landscapes.',
        totalDistanceMeters: 25000,
        color: '#22C55E',
        difficulty: 'Hard',
        image: require('../../assets/kumara_parvatha.png'),
        startCoordinate: { latitude: 12.66, longitude: 75.68 },
        endCoordinate: { latitude: 12.66, longitude: 75.68 },
        region: {
            latitude: 12.66,
            longitude: 75.68,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        },
        landmarks: [
            { id: 'kp1', name: 'Kukke Temple', distanceMeters: 0, description: 'Start' },
            { id: 'kp2', name: 'Bhattara Mane', distanceMeters: 6000, description: 'Forest house' },
            { id: 'kp3', name: 'Kallu Mantapa', distanceMeters: 9000, description: 'Stone shelter' },
            { id: 'kp4', name: 'Shesha Parvatha', distanceMeters: 11000, description: 'False peak' },
            { id: 'kp5', name: 'Kumara Parvatha', distanceMeters: 13000, description: 'Summit' },
            { id: 'kp6', name: 'Kukke', distanceMeters: 25000, description: 'Back to base' },
        ]
    },
    {
        id: 'mullayanagiri-trek',
        name: 'Mullayanagiri Trek',
        description: 'Trek to the highest peak in Karnataka.',
        extendedDescription: 'A pleasant trek in the coffee district of Chikmagalur. The trail is often misty and windy. At the top, there is a small temple dedicated to Mullappa Swamy. Great for beginners.',
        totalDistanceMeters: 6000,
        color: '#14B8A6',
        difficulty: 'Easy',
        image: require('../../assets/mullayanagiri.png'),
        startCoordinate: { latitude: 13.39, longitude: 75.72 },
        endCoordinate: { latitude: 13.39, longitude: 75.72 },
        region: {
            latitude: 13.39,
            longitude: 75.72,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        },
        landmarks: [
            { id: 'mg1', name: 'Sarpadhari', distanceMeters: 0, description: 'Trailhead' },
            { id: 'mg2', name: 'Nandi Statue', distanceMeters: 1500, description: 'Landmark' },
            { id: 'mg3', name: 'Cave', distanceMeters: 2500, description: 'Caves' },
            { id: 'mg4', name: 'Summit', distanceMeters: 3000, description: 'Temple at top' },
            { id: 'mg5', name: 'Sarpadhari', distanceMeters: 6000, description: 'Descend' },
        ]
    },
    {
        id: 'chembra-peak',
        name: 'Chembra Peak Trek',
        description: 'Known for its heart-shaped lake in Wayanad, Kerala.',
        extendedDescription: 'A scenic hike through tea gardens and forests. The main attraction is the Hridaya Saras, a heart-shaped lake that is believed to never dry up. Offers views of the Nilgiris.',
        totalDistanceMeters: 9000,
        color: '#84CC16',
        difficulty: 'Moderate',
        image: require('../../assets/chembra_peak.png'),
        startCoordinate: { latitude: 11.51, longitude: 76.09 },
        endCoordinate: { latitude: 11.51, longitude: 76.09 },
        region: {
            latitude: 11.51,
            longitude: 76.09,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        },
        landmarks: [
            { id: 'cp1', name: 'Forest Office', distanceMeters: 0, description: 'Checkpost' },
            { id: 'cp2', name: 'Watchtower', distanceMeters: 2000, description: 'Viewpoint' },
            { id: 'cp3', name: 'Heart Lake', distanceMeters: 4500, description: 'Hridaya Saras' },
            { id: 'cp4', name: 'Forest Office', distanceMeters: 9000, description: 'Return' },
        ]
    },
    {
        id: 'rajmachi-trek',
        name: 'Rajmachi Trek',
        description: 'A historical fort trek in the Sahyadris, beautiful in monsoons.',
        extendedDescription: 'A favorite among monsoon trekkers. Famous for fireflies in pre-monsoon. The twin forts of Shrivardhan and Manaranjan offer great views. Can be started from Lonavala or Karjat.',
        totalDistanceMeters: 16000,
        color: '#F43F5E',
        difficulty: 'Easy',
        image: require('../../assets/rajmachi.png'),
        startCoordinate: { latitude: 18.82, longitude: 73.39 },
        endCoordinate: { latitude: 18.82, longitude: 73.39 },
        region: {
            latitude: 18.82,
            longitude: 73.39,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        },
        landmarks: [
            { id: 'rm1', name: 'Udhewadi', distanceMeters: 0, description: 'Base village' },
            { id: 'rm2', name: 'Shrivardhan', distanceMeters: 4000, description: 'Higher fort' },
            { id: 'rm3', name: 'Manaranjan', distanceMeters: 8000, description: 'Lower fort' },
            { id: 'rm4', name: 'Kondhane Caves', distanceMeters: 12000, description: 'Ancient caves' },
            { id: 'rm5', name: 'Kondhane', distanceMeters: 16000, description: 'End point' },
        ]
    },
    {
        id: 'dzukou-valley',
        name: 'Dzükou Valley Trek',
        description: 'The valley of flowers in Northeast India, Nagaland.',
        extendedDescription: 'A hidden gem on the Nagaland-Manipur border. Famous for the endemic Dzukou Lily and rolling emerald green hills. The landscape is unique, unlike anywhere else in India.',
        totalDistanceMeters: 20000,
        color: '#06B6D4',
        difficulty: 'Moderate',
        image: require('../../assets/dzukou_valley.png'),
        startCoordinate: { latitude: 25.55, longitude: 94.07 },
        endCoordinate: { latitude: 25.55, longitude: 94.07 },
        region: {
            latitude: 25.55,
            longitude: 94.07,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        },
        landmarks: [
            { id: 'dv1', name: 'Viswema', distanceMeters: 0, description: 'Starting point' },
            { id: 'dv2', name: 'Rest Point', distanceMeters: 5000, description: 'Midway' },
            { id: 'dv3', name: 'Guest House', distanceMeters: 10000, description: 'Valley view' },
            { id: 'dv4', name: 'Valley Bottom', distanceMeters: 12000, description: 'Explore' },
            { id: 'dv5', name: 'Viswema', distanceMeters: 20000, description: 'Return' },
        ]
    },
    {
        id: 'sandakphu-trek',
        name: 'Sandakphu Trek',
        description: 'West Bengal\'s highest peak offering views of 4 of the world\'s highest mountains.',
        extendedDescription: 'A classic ridge trek along the Indo-Nepal border. On a clear day, see Everest, Kanchenjunga, Lhotse, and Makalu. Visit various villages and experience the culture.',
        totalDistanceMeters: 45000,
        color: '#F97316',
        difficulty: 'Moderate',
        image: require('../../assets/sandakphu.png'),
        startCoordinate: { latitude: 27.10, longitude: 88.00 },
        endCoordinate: { latitude: 27.10, longitude: 88.00 },
        region: {
            latitude: 27.10,
            longitude: 88.00,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        },
        landmarks: [
            { id: 'sp1', name: 'Manebhanjan', distanceMeters: 0, description: 'Start' },
            { id: 'sp2', name: 'Tumling', distanceMeters: 11000, description: 'Nepal border' },
            { id: 'sp3', name: 'Kalipokhari', distanceMeters: 26000, description: 'Black pond' },
            { id: 'sp4', name: 'Sandakphu', distanceMeters: 32000, description: 'Summit View' },
            { id: 'sp5', name: 'Srikhola', distanceMeters: 45000, description: 'End point' },
        ]
    },
    {
        id: 'harishchandragad-trek',
        name: 'Harishchandragad Trek',
        description: 'Famous for the Konkan Kada cliff and ancient temples.',
        extendedDescription: 'A hill fort in Ahmednagar district. The Konkan Kada is a massive cliff with a concave shape. The Kedareshwar Cave has a big Shiva Linga surrounded by water.',
        totalDistanceMeters: 12000,
        color: '#A855F7',
        difficulty: 'Moderate',
        image: require('../../assets/harishchandragad.png'),
        startCoordinate: { latitude: 19.38, longitude: 73.77 },
        endCoordinate: { latitude: 19.38, longitude: 73.77 },
        region: {
            latitude: 19.38,
            longitude: 73.77,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        },
        landmarks: [
            { id: 'hc1', name: 'Pachnai', distanceMeters: 0, description: 'Base village' },
            { id: 'hc2', name: 'Harishchandreshwar', distanceMeters: 3000, description: 'Temple' },
            { id: 'hc3', name: 'Konkan Kada', distanceMeters: 4000, description: 'Major cliff' },
            { id: 'hc4', name: 'Taramati Peak', distanceMeters: 6000, description: 'Highest point' },
            { id: 'hc5', name: 'Pachnai', distanceMeters: 12000, description: 'Return' },
        ]
    }
];


// Combined for backward compatibility
// Combined for backward compatibility
export const TRAILS: Trail[] = [...INDIAN_TRAILS];

