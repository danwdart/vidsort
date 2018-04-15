import IndexController from '../controllers/index';
import SortController from '../controllers/sort';
import ResetController from '../controllers/reset';
import MissingController from '../controllers/missing';
import ViewController from '../controllers/view';

export default app => {
    app.get(`/`, IndexController);
    app.get(`/sort`, SortController);
    app.get(`/reset`, ResetController);
    app.get(`/missing`, MissingController);
    app.get(`/view`, ViewController);
};