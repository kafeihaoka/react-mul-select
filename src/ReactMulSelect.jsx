import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.less';

export default class ReactMulSelect extends Component {
    constructor(props) {
        super(props);
        this.state ={
            isOpen:false,
            searchWord: '',
            showLabel: this.props.selectAllMainValue.label,
            selectedAll: [false, false] //主维度次维度全选时true
        }
        Object.assign(
            this.state, 
            this.initUpdate(this.props.options || [], this.props.value || ['0-0']), 
            {showLabel: this.getShowLabel(this.props.options || [], this.props.value || ['0-0'])},
            {isOpen: !this.props.showInput ? this.props.isOpen : false}
        )
        this.selectValueContainer = null;
    }
    static displayName = 'AnMulSelect';

    static propTypes = {
        /**
         * 组件外层容器className
         */
        containerClassName: PropTypes.string,
        /**
         * 弹框容器className
         */
        popClass: PropTypes.string,
        /**
         * 是否展开 - showInput为false时生效；使用场景：自定义外部input框;需在onOk控制props isOpen
         */
        isOpen: PropTypes.bool,
        /**
         * 是否展示input
         */
        showInput: PropTypes.bool,
        /**
         * value 自定义下拉框一级列表选择全部的相对数据
         */
        selectAllMainValue: PropTypes.object,
        /**
         * subValue 自定义下拉框二级列表选择全部的相对数据
         */
        selectAllSubValue: PropTypes.object,
        /**
         * value list
         */
        value: PropTypes.array,
        /**
         * original options
         */
        options: PropTypes.array,
        /**
         * change事件
         */
        onOk: PropTypes.func,
        /**
         * 禁止点击
         */
        disabled: PropTypes.bool,
        /**
         * change事件
         */
        onChange: PropTypes.func,
    };

    static defaultProps = {
        value: ['0-0'],
        options: [],
        showInput: true,
        containerClassName: '',
        popClass: '',
        selectAllMainValue: {value:'-1',label:'全部'},
        selectAllSubValue: {value:'-1',label:'全部'},
        disabled: false,
    };

    /**
     * 
     * @param {props} options 
     * @param {props} value 
     */
    initUpdate = (options, value) => {
        if(!options || !options.length){
            return {
                option: [],
                subOption: [],
                value: value
            }
        }
        let KeyObj = this.getSelectKeyObj(value);
        // console.log(KeyObj)

        let subOption = [];
        let option = options.map( (obj, i) => {
            let newobj = {
                ...obj,
                key: String(i),
                checked: Object.keys(KeyObj).includes(String(i))?KeyObj[String(i)].length === obj.children.length?'checked':'partchecked':'unchecked', // checked unchecked partchecked
                children: obj.children && obj.children.length ? obj.children.map( (v, j) => {
                    return {
                        ...v,
                        key: `${i}-${j}`,
                        checked: value.includes(`${i}-${j}`) ? 'checked' : 'unchecked' // checked unchecked
                    }
                }) : []
            };

            //当value为[],默认选中全部，此时次级列表展示所有选项
            if(!Object.keys(KeyObj).length) subOption = subOption.concat(newobj.children);

            if(Object.keys(KeyObj).includes(String(i))) subOption = subOption.concat(newobj.children);
            return newobj
        });
        return {
            option: option,
            subOption: subOption,
            value: value,
            selectedAll: value.length ? [false, false] : [true, true]
        }
    }

    componentWillReceiveProps(nextProps) {
        let isOpen = {};
        if(!nextProps.showInput){
            isOpen = {
                isOpen: nextProps.isOpen
            }
        }
        const is = (nextProps.options && nextProps.options.toString() !== this.props.options.toString()) ||
        (nextProps.value && nextProps.value.toString() !== this.props.value.toString());
         
        if(is){
            this.setState({
                ...this.initUpdate(nextProps.options, nextProps.value),
                showLabel:this.getShowLabel(nextProps.options, nextProps.value),
                ...isOpen
            });
        }else {
            if(Object.keys(isOpen).length) this.setState(isOpen);
        }
        
    }

    componentDidMount() {
        document.addEventListener('click', this.handleEventListenerClick);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleEventListenerClick);
    }

    handleEventListenerClick = (e) => {
        if(!this.selectValueContainer) return;
        const _isSelf = this.selectValueContainer === e.target || this.selectValueContainer.contains(e.target);
        if(!_isSelf || !this.state.isOpen){
            const { isOpen } = this.state;
            if(!isOpen) return;
            this.handleMenuOk();
        }
    }

    renderOptionChildren = () => {

        const { selectAllMainValue, selectAllSubValue, popClass } = this.props;
        const { option, subOption, selectedAll } = this.state;

        const {filterOption, filterSubOption} = this.getSearchFilter(option, subOption);

        return <div className={`anMulSelectContent ${popClass}`} onClick={ e => e.nativeEvent.stopImmediatePropagation()}>
            <div className={'anMulSearchcontainer'}>
                <img src={require('./img/sousuo.png')} className={'searchIcon'} alt='' />
                <input className={'anMulSearchClass'} value={this.state.searchWord} onChange={this.handleSearchInputChange} />
            </div>
            <div className={'anMulSelectOptionContainer'}>
                <ul className={'anMulSelectOption'}>
                    <li className={`anMulSelectLi`} onMouseDown={this.handleMainValueChange.bind(this,selectAllMainValue)} key={selectAllMainValue.value}>
                        <span className={`${selectedAll[0]?'anMulSelectActive':''}`}>{selectAllMainValue.label}</span>
                        <img src={require(`${selectedAll[0]?"./img/checked.png":"./img/unchecked.png"}`)} alt='' />
                    </li>
                    {filterOption.map(obj=>{
                        return <li className={`anMulSelectLi`} onMouseDown={this.handleMainValueChange.bind(this,obj)} key={obj.value}>
                            <span className={`${obj.checked === 'checked'?'anMulSelectActive':''}`}>{obj.label}</span>
                            <img src={require(`./img/${obj.checked}.png`)} alt='' />
                        </li>
                    })}
                </ul>
                <ul className={'anMulSelectOption'}>
                    <li className={`anMulSelectLi`} onMouseDown={this.handleSubValueChange.bind(this,selectAllSubValue)} key={selectAllSubValue.value}>
                        <span className={`${selectedAll[1]?'anMulSelectActive':''}`}>{selectAllSubValue.label}</span>
                        <img src={require(`${selectedAll[1]?"./img/checked.png":"./img/unchecked.png"}`)} alt='' />
                    </li>
                    {filterSubOption.map(obj=>{
                        return <li className={`anMulSelectLi`} onMouseDown={this.handleSubValueChange.bind(this,obj)} key={obj.value}>
                            <span className={`${obj.checked === 'checked' && !selectedAll[1]?'anMulSelectActive':''}`}>{obj.label}</span>
                            <img src={require(`./img/${selectedAll[1]?'unchecked':obj.checked}.png`)} alt='' />
                        </li>
                    })}
                </ul>
            </div>
            
            <div className="anMulselectFooter">
                <span className="anMulselectFooterConfirm" onClick={this.handleMenuOk.bind(this)}>确定</span>
                <span className="anMulselectFooterClear" onClick={this.handleMenuClear.bind(this)}>清空</span>
            </div>
        </div>;
    };

    //改装为对象
    getSelectKeyObj = (value) => {
        let KeyObj = {};
        value.forEach( str => {
            let l_str = str.split('-');
            if(!KeyObj[l_str[0]]) KeyObj[l_str[0]] = [];
            KeyObj[l_str[0]].push(l_str[1]);
        })
        return KeyObj
    }

    //search filter
    getSearchFilter = () => {
        const { option, subOption, searchWord } = this.state;
        if(searchWord === ''){
            return {
                filterOption: option,
                filterSubOption: subOption
            }
        }
        let newSubOption = [];
        let allSubOption = [];
        const reg = new RegExp(searchWord, 'gi');
        let newOption = option.length ? option.filter( obj => {
            let match = String(obj.label+obj.value).match(reg);
            allSubOption = allSubOption.concat(obj.children);
            if(!!match) newSubOption = newSubOption.concat(obj.children);
            return !!match;
        }):[];
        let subKeys = newSubOption.map(v=>v.key);
        allSubOption.forEach(e => {
            let subMatch = String(e.label+e.value).match(reg);
            if(!subKeys.includes(e.key) && !!subMatch){
                newSubOption.push(e)
            }
        })

        return {
            filterOption: newOption,
            filterSubOption: newSubOption
        }
    }

    handleSearchInputChange = (e) => {
        // console.log(e.target.value)
        this.setState({
            searchWord: e.target.value
        })
    }

    handleMainValueChange = (e) => {
        const { selectAllMainValue, options } = this.props;
        const { value, option } = this.state;
        let newValue = [...value];
        let newOption = [].concat(option);
        let newSubOption = [];
        if(e.value === selectAllMainValue.value){
            this.setState(this.initUpdate(options, []));
        }else{
            newOption[e.key] = {
                ...e,
                checked: e.checked === 'unchecked' || e.checked === 'partchecked'?'checked':'unchecked',
                children: e.children && e.children.length ? e.children.map( o => {
                    return {
                        ...o,
                        checked: e.checked !== 'checked' ? 'checked' : 'unchecked' // checked unchecked
                    }
                }) : []
            };
            switch(e.checked){
                case 'checked':
                    //先不考虑只有一个不能取消选择的情况
                    newValue = newValue.filter( str => str.split('-')[0] !== e.key);
                break;
                case 'unchecked':
                case 'partchecked':
                    e.children.forEach(obj => {
                        if(!newValue.includes(obj.key)) newValue.push(obj.key);
                    })
                break;
                default:
                break;
            }

            let keyObj = this.getSelectKeyObj(newValue);
            newOption.forEach( (obj, i) => {
                if(Object.keys(keyObj).includes(String(i))) newSubOption = newSubOption.concat(obj.children);                        
            });
            
            this.setState({
                option: newOption,
                subOption: newSubOption,
                value: newValue,
                selectedAll: newValue.length ? [false, false] : [true, true]
            })
        }
    }

    handleSubValueChange = (e) => {
        const { selectAllSubValue } = this.props;
        const { value, option, subOption, selectedAll } = this.state;
        let newValue = [...value];
        let newOption = [].concat(option);
        let newSubOption = [];
        if(e.value === selectAllSubValue.value){
            newSubOption = subOption.map( v => {
                if(!newValue.includes(v.key)) newValue.push(v.key);
                return {
                    ...v,
                    checked: 'checked'
                }
            });
            let currKeys = Object.keys(this.getSelectKeyObj(newValue));

            newOption = newOption.map( v => {
                
                return {
                    ...v,
                    checked: currKeys.includes(v.key) ? 'checked' : 'unchecked',
                    children: v.children.map( o => {

                        return {
                            ...o,
                            checked: 'checked'
                        }
                    })
                }
            });
            this.setState({
                option: newOption,
                subOption: newSubOption,
                value: newValue,
                selectedAll: newValue.length ? [false, true] : [true, true]
            })
        }else{
            if(e.checked === "checked"){
                if(selectedAll[1]){
                    newValue = [e.key];
                }else{
                    newValue = newValue.filter( str => str !== e.key);
                }
            }else{
                newValue.push(e.key)
            }

            let keyObj = this.getSelectKeyObj(newValue);

            let parentNodeId = e.key.split('-')[0];

            if(selectedAll[1]){
                newOption = newOption.map((obj, i) => {
                    // console.log(keyObj,obj.key)
                    return {
                        ...obj,
                        checked: !Object.keys(keyObj).includes(obj.key)?'unchecked':keyObj[obj.key].length === obj.children.length?'checked':'partchecked',
                        children: obj.children && obj.children.length ? obj.children.map( o => {
                            return {
                                ...o,
                                checked: newValue.includes(o.key) ? 'checked' : 'unchecked' // checked unchecked
                            }
                        }) : []
                    }
                })
            }else{
                newOption[parentNodeId] = {
                    ...newOption[parentNodeId],
                    checked: keyObj[parentNodeId]?keyObj[parentNodeId].length === newOption[parentNodeId].children.length?'checked':'partchecked':'unchecked',//通过子集的数量去状态判断
                    children: newOption[parentNodeId].children && newOption[parentNodeId].children.length ? newOption[parentNodeId].children.map( o => {
                        return {
                            ...o,
                            checked: newValue.includes(o.key) ? 'checked' : 'unchecked' // checked unchecked
                        }
                    }) : []
                }
            }
            
            newOption.forEach( (obj, i) => {
                if(Object.keys(keyObj).includes(String(i))) newSubOption = newSubOption.concat(obj.children);                        
            });
            
            this.setState({
                option: newOption,
                subOption: newSubOption,
                value: newValue,
                selectedAll: newValue.length ? [false, false] : [true, true]
            })
        }
    }

    //初始化获取showLabel
    getShowLabel = (option,value) => {
        // console.log(option, value)
        const { selectAllMainValue, selectAllSubValue } = this.props;
        let showLabel = selectAllMainValue.label; //显示的label
        if(value.length){
            //查看选中的次级维度是不是同一主维度下的
            let selectKeyObj = this.getSelectKeyObj(value);
            if(Object.keys(selectKeyObj).length === 1){
                showLabel = option[Object.keys(selectKeyObj)[0]].label;                
            }else{
                showLabel = `${value.length}个${selectAllSubValue.label.split('全部')[1]}`;                
            }
        }
        return showLabel
    }

    handleMenuOk = () => {
        const { value, selectedAll, option } = this.state;
        const { selectAllMainValue, selectAllSubValue } = this.props;

        if(value && value.toString() === this.props.value.toString()){
            this.handleClose();
            if(this.props.onOk !== undefined) this.props.onOk();
            return;
        }

        //默认选中全部
        let subLabel = []; //hover显示次级的label
        let showLabel = selectAllMainValue.label; //显示的label
        let firstLevelId = [selectAllMainValue.value];
        let secondLevelId = [selectAllSubValue.value];

        if(value.length){
            secondLevelId = [];
            //查看选中的次级维度是不是同一主维度下的
            let selectKeyObj = this.getSelectKeyObj(value);
            if(Object.keys(selectKeyObj).length === 1){
                showLabel = option[Object.keys(selectKeyObj)[0]].label;                
            }else{
                showLabel = `${value.length}个${selectAllSubValue.label.split('全部')[1]}`;                
            }
            for(let v in value){
                let [a, b] = value[v].split('-');
                subLabel.push(option[a].children[b].label);
                secondLevelId.push(option[a].children[b].value)
            }

            firstLevelId = Object.keys(selectKeyObj).map(v => {
                return option[v].value
            })
        }

        this.setState({
            showLabel
        })
        if(this.props.onOk !== undefined) this.props.onOk({
            value, //当前选中的值
            selectedAll, //主次维度是否选中全部
            subLabel, //hover需要显示的选中项
            showLabel, //需要显示的label
            firstLevelId, //业务需要的一级id列表
            secondLevelId //业务需要的二级id列表
        });

        this.handleClose();
    }

    handleMenuClear = () => {
        // this.onClear();
        this.setState(this.initUpdate(this.props.options, []));
    }

    handleChange(e){
        this.setState({
            isOpen:false
        })
        if(this.props.onChange !== undefined) this.props.onChange(e)
    }

    handleOpen(){
        if(this.props.disabled) return;
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    handleClose(){
        if(this.state.isOpen){
            this.setState({
                isOpen:false
            })
        }
    }

    render() {
        const { disabled, showInput, containerClassName } = this.props;
        const { isOpen, showLabel } = this.state;
        return (
            <div className={`anMulSelectContainer ${containerClassName}`} >
                <div ref={v => {this.selectValueContainer = v}}>
                    {showInput ? <div className={`anMulSelectValueContainer ${disabled?'cursor_not_allow':''}`} onMouseDown={this.handleOpen.bind(this)}>
                        <span className={'anMulSelectValue'} title={showLabel}>{showLabel}</span>
                        <div className={isOpen?'upIcon':'downIcon'}></div>
                    </div> : this.props.children}
                </div>
                {isOpen?this.renderOptionChildren():null}
            </div>
        );
    }
}
