import { Link } from 'react-router-dom';
import { useState } from 'react';
import Header from './header';
import CategoryCard from './CategoryCard';
import { Row, Col, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import './CategoryCard.css';

function Activity() {

    const [categories, setCategories] = useState([
        { id: 1, category: 'Spiritual', img: '/images/Spiritual.svg', color: '#5fcca1' },
        { id: 2, category: 'Wellness', img: '/images/Wellness.png', color: '#d67729' },
        { id: 3, category: 'Music', img: '/images/Music.svg', color: '#5fcca1' },
        { id: 4, category: 'Performing Arts', img: '/images/PerformingArts.svg', color: '#d67729' },
        { id: 5, category: 'Visual Arts', img: '/images/VisualArts.svg', color: '#5fcca1' },
        { id: 6, category: 'Literature', img: '/images/Literature.svg', color: '#d67729' },
        { id: 7, category: 'Culinary', img: '/images/Culinary.svg', color: '#5fcca1' },
        { id: 8, category: 'Crafts', img: '/images/Crafts.svg', color: '#d67729' },
        { id: 9, category: 'Exploration', img: '/images/Explore.svg', color: '#5fcca1' },
    ]);

    const [selectedCardId, setSelectedCardId] = useState(null);
    const handleCardClick = (id, category) => {
        setSelectedCardId(id);
        localStorage.setItem('ActivityCategory', category);
    };

    return (
        <>
            <Header />
            <span className='headtext'>Pick an Activity Category to Schedule</span>
            <div className='div1'>
                <Row gutter={[150]}>
                    {categories.map((category) => (
                        <Col md={8} >
                            <CategoryCard
                                id={category.id}
                                key={category.id}
                                category={category.category}
                                isSelected={category.id === selectedCardId}
                                img={category.img}
                                color={category.color}
                                onClick={handleCardClick} />
                        </Col>


                    ))}
                </Row>
            </div>

            <Button className="nextbutton" shape="round" type='primary' icon={<ArrowRightOutlined />} size='medium' disabled={!selectedCardId}>
                <Link to="/Calendar">Next</Link>
            </Button>

        </>
    );
};

export default Activity