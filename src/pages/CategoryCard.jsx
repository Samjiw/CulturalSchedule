import { Card } from 'antd';
import './CategoryCard.css';

function CategoryCard(props) {
    const { category, isSelected, onClick, id, img, color } = props;
    const overlayColor = `${color}99`;
    return (
        <div className='i' onClick={() => onClick(id, category)}>
            <Card
                style={{ marginBottom: '5px', backgroundImage: `linear-gradient(${overlayColor}, ${overlayColor}), url(${img})` }}
                className={`categorycard ${isSelected ? 'selected-card' : ''}`}>
            </Card>
            <span className='x11'>{category}</span>
        </div >
    );
}

export default CategoryCard;

