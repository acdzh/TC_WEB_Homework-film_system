import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { Affix, Button, Col, Divider, Icon, Input, Layout, Pagination, Row } from "antd";
import './index.css';
import 'antd/dist/antd.css'; 
import emitter from "./ev"
const Search = Input.Search;
const { Header, Footer,  Content} = Layout;
const root = document.getElementById('root');


const MovieImage = (props) => <img src={props.src} alt={props.title} style={{height: "170px"}} onError={(e)=>{e.target.onerror = null; e.target.src="https://s2.ax1x.com/2019/04/28/EMuGLj.png"}} />;

class Objects extends React.Component{
    static defaultProps = { haslink: true, less: true };
    render(){
        const less = this.props.less;
        const objects = this.props.objects.length > 4 && less ? this.props.objects.slice(0, 4) : this.props.objects;
        const objectList = [];
        const haslink = this.props.haslink;
        for(let i in objects){
            const sep = parseInt(i)  === objects.length - 1 ? "" : " / ";
            objectList.push(<span key={i}>{haslink ? <a href={"https://movie.douban.com/celebrity/"+ objects[i].id}>{objects[i].name}</a> : <span>{objects[i]}</span>}{sep}</span>);
        }
        if(this.props.objects.length > 4 && less){ objectList.push(<span>/ ...</span>) }
        return(
            <div>
                <span><span className="pl">{this.props.title}</span>  : </span>
                { haslink ? <span className="attrs">{objectList}</span> : <span>{objectList}</span> }
            </div>
        );
    }
}

class MovieDetail extends React.Component{
    static defaultProps = { less: true };
    render() { return(
        <div className="info">
            <Objects title="导演" objects={this.props.values.directors} />
            <Objects title="编剧" objects={this.props.values.writers} />
            <Objects title="主演" objects={this.props.values.casts} />
            <Objects title="类型" less={false} haslink={false} objects={this.props.values.genres} />
            <Objects title="语言" haslink={false} objects={this.props.values.languages} display="false"/>
        </div>
    );}
}

const MovieStarDetail = props => (
    <div>
        <span className="starstop"> 5星 </span>
        <div className="power" style={{width: props.star + "px"}}></div>
        <span className="rating_per">{props.star}%</span><br />
    </div>
);

const MovieStar = props => {
        const rating = props.values.rating;
        const rating_people = rating.rating_people === "" ? "0" : rating.rating_people;
        const rating_avg = rating.average === "" ? "NaN" : rating.average;
        var stars_5, stars_4, stars_3, stars_2, stars_1 = "0"; 
        if(rating.stars !== []){
            stars_5 = rating.stars[0]; 
            stars_4 = rating.stars[1];
            stars_3 = rating.stars[2];
            stars_2 = rating.stars[3];
            stars_1 = rating.stars[4];
        }
        const star_str = (Math.round(rating_avg) * 5).toString();
        const star_class = "bigstar" + (rating.rating_people === "" ? "00" :  (star_str[0] + star_str[1]));
        return(
            <div className="rating_wrap">
                <div className="rating_self">
                    <strong className="rating_num">{rating_avg} </strong>
                    <div className="rating_right">
                        <div className={star_class}></div>
                        <div className="rating_sum">{rating_people}人评价</div>
                    </div>
                </div>
                <div className="ratings-on-weight">
                    <MovieStarDetail star={stars_5}/>
                    <MovieStarDetail star={stars_4}/>
                    <MovieStarDetail star={stars_3}/>
                    <MovieStarDetail star={stars_2}/>
                    <MovieStarDetail star={stars_1}/>
                </div>
            </div>
        );

}

class MovieCard extends React.Component{
    onclick = () => {emitter.emit('setDetail', this.props.values)};
    render(){
        const j = this.props.values;
        return(
            <div className="card" style={{ width: "100%" , boxShadow: "0 2px 8px #f0f1f2"}}>
                <Divider />
                <div className="cardbody">
                    <Row>
                        <Col lg={4} md={4} sm={24} xs={24}><MovieImage src={j.poster} title={j.title} /></Col>
                        <Col lg={14}  md={14} sm={14} xs={24}>
                            <h2 className="h2title">
                                <span>{j.title} </span><span className="year"> ({j.year})</span>
                            </h2>
                            <MovieDetail values={j}/>
                        </Col>
                        <Col lg={6}  md={6} sm={6} xs={24}><MovieStar values={j} /></Col>
                    </Row>
                </div>
                <div className="openmorebtn"> <Button size="small" onClick={this.onclick}>More ></Button></div>
            </div>
        );
    }
}

class Movies extends React.Component{
    constructor(props){
        super(props);
        this.state = {data:[]};
    }
    componentDidMount() {
        fetch("http://film.acdzh.ltd/api/list?begin=0&end=5")
        .then(res => res.json())
        .then((result) => { 
            this.setState({data: result}); 
            emitter.emit('setDetail', result[0]);
        });
    }
    onChange = (current, pageSize) => {
        const begin =  pageSize * (current-1);
        const end = pageSize * current; 
        fetch("http://film.acdzh.ltd/api/list?begin=" + begin.toString() + "&end=" + end.toString())
        .then(res => res.json())
        .then((result) => { 
            this.setState({data: result}); 
            emitter.emit('setDetail', result[0]);
        });
        
    };
    render(){
        const movieList = [];
        for(let i = 0; i < this.state.data.length; i++){
            movieList.push(<span><MovieCard values={this.state.data[i]} id={i}/></span>)
        }
        return(
            <div style={{width: "100%"}}>
                {movieList}
                <br />
                <span style={{textAlign: "center"}}>
                    <Pagination showQuickJumper showSizeChanger 
                                defaultCurrent={1} total={10000} defaultPageSize={5}
                                pageSizeOptions={['5', '10', '15', '20']}
                                onChange={this.onChange} onShowSizeChange={this.onChange}
                    />
                </span><br />
                <br />
            </div>
        );
    }
}

class Loading extends React.Component{
    constructor(props){
        super(props);
        this.state = {time: 0};
        this.loads = ["Loading", " Loading.", "  Loading..", "   Loading..."];
    }
    componentDidMount() {
        this.timerID = setInterval(
          () => this.tick(),
          600
        );
      }
    
      componentWillUnmount() {
        clearInterval(this.timerID);
      }
    tick(){
        const nowTime = this.state.time + 1;
        this.setState({time: nowTime})
    }
    render(){
        return(
            <div style={{width: "100%",textAlign:"center"}}><h3>{this.state.time<30?this.loads[this.state.time%4]:"No Result..."}</h3></div>
        );
    }
}


class SearchedResults extends React.Component{
    constructor(props){
        super(props);
        this.state = {start: 0, end: 5, searchResult:[], loading: false};
        this.keyWord = "";
    }

    onChange = (current, pageSize) => { 
        this.setState( () => ({start: pageSize*(current-1), end: pageSize*current}) );
    };
    render(){
        emitter.emit('setDetail', {});
        if(!(this.keyWord === this.props.searchKey)){
            this.setState({loading: true});
            fetch("http://film.acdzh.ltd/api/search?key=" + this.props.searchKey)
            .then(res => res.json())
            .then((result) => { 
                this.setState({searchResult: result, loading: false}); 
            });
        }
        this.keyWord = this.props.searchKey;

        const movieList = [];
        for(let i = this.state.start; i < this.state.end && i < this.state.searchResult.length; i++){
            movieList.push(<span><MovieCard values={this.state.searchResult[i]} id={i}/></span>)
        }

        if(movieList.length === 0 || this.state.loading){
            return (<Loading />)
        }
        else{
            emitter.emit('setDetail', this.state.searchResult[0]);
            return(
                <div style={{width: "100%"}}>
                    {this.state.loading ? <div>loading</div> : movieList}
                    <br />
                    <span style={{textAlign: "center"}}>
                        <Pagination showQuickJumper showSizeChanger 
                                    defaultCurrent={1} total={this.state.searchResult.length} defaultPageSize={5}
                                    pageSizeOptions={['5', '10', '15', '20']}
                                    onChange={this.onChange} onShowSizeChange={this.onChange}
                        />
                    </span><br />
                    <br />
                </div>
            );
        }
    }
}


class Details extends React.Component{
    constructor(props) {
        super(props);
        this.state = {data : {}};
    }
    componentDidMount(){
        this.eventEmitter = emitter.addListener("setDetail", (msg) => {this.setState({data: msg});});
    }
    componentWillUnmount(){
        emitter.removeListener(this.eventEmitter);
    }
    render(){
        const j = this.state.data; 
        if(j["aka"] === undefined) { return (<div> </div>) }
        else {
            j.summary = j.summary.split(",").join(", ");
            j.summary = j.summary.split(".").join(". ");
            return (
                <Affix offsetTop={8}>
                <div className="detailcard" style={{ width: "100%" , boxShadow: "0 2px 8px #f0f1f2"}}>
                    <Divider />
                    <div className="detailcardbody">
                        <h2 className="h2title">
                            <span>{j.title} </span>
                            <span className="year"> ({j.year})</span>
                        </h2>
                        <div className="info">
                        <Objects title="导演" less={false} objects={j.directors} />
                        <Objects title="编剧" less={false} objects={j.writers} />
                        <Objects title="主演" less={false} objects={j.casts} />
                        <Objects title="类型" less={false} haslink={false} objects={j.genres} />
                        <Objects title="国家" haslink={false} objects={j.countries} display="false"/>
                        <Objects title="语言" haslink={false} objects={j.languages} display="false"/>
                        <Objects title="上映日期" haslink={false} objects={j.pubdate} display="false"/>
                        <Objects title="别名" haslink={false} objects={j.aka[0]===""?["无"]:j.aka} display="false"/>
                        <div>
                        <span><span className="pl">外部链接</span> : </span>
                        <span>
                            <a href={"https://movie.douban.com/subject/"+j._id}>豆瓣 </a> / 
                            <a href={"https://www.imdb.com/title/"+j.imdb}> IMDB</a>
                        </span> 
                        </div>
                        <br />
                        <span><span className="pl">简介</span> : </span>
                        <span>{j.summary}</span> 
                    </div>
                    </div>
                </div>
                </Affix>
            );
        }
    }
}

class MyContent extends React.Component{
    constructor(props){
        super(props);
        this.state= {};
    }
    render(){
        return(
            <Row>
                <Col lg={13} md={24} sm={24} xs={24}>
                    {this.props.searchedPage ? <SearchedResults searchKey={this.props.searchKey} /> : <Movies />}
                </Col>
                <Col lg={9} md={24} sm={24} xs={24} style={{paddingLeft: "80px"}}>
                    <Details />
                </Col>
            </Row>
        );
    }
}



class MyHeader extends React.Component{
    render(){
        return(
            <div>
                <Row>
                    <Col span={3}> <a href="#" onClick={this.props.home} className="home"><h1> <Icon type="home" /> Movies</h1></a>
                    </Col>
                    <Col span={10}>                   
                        <Search
                            placeholder="Input search text"
                            onSearch={value=>this.props.search(value)}
                            style={{width: 300 }}
                        />
                    </Col>
                </Row>
            </div>
        );
    }
}

class Page extends React.Component{
    constructor(props){
        super(props);
        this.searchedPage = false;
        this.searchKey = "";
    };
    search = (str) =>{
        this.searchedPage = true;
        this.searchKey = str;
        this.forceUpdate();
    }
    backHome = () =>{};
    render(){
        return(
            <Layout style={{background: "#fff"}}>
                <Header style={{background: "#fff", boxShadow: "0 2px 8px #f0f1f2"}}>
                    <MyHeader home={this.backHome} search={this.search}/>
                </Header>
                <br />
                <Content style={{background: "#fff"}}>
                    <MyContent searchedPage={this.searchedPage} searchKey={this.searchKey}/>
                </Content>
                <br />
                <Footer style={{ textAlign:'center', background: "#fff", boxShadow: "0 2px 8px #f0f1f2"}}>Web of Movies ©2019 Created by 1751130</Footer>
            </Layout>
        );
    }
}

ReactDOM.render(<Page /> , root);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
