/**
 * 分页查询通用组件
 */
(function($){
    /**
     * @param requestUrl 请求地址
     * @param pageNumName 代表当前页码的请求参数
     * @param pageCount 总页数，可以设置为常量，表示只提供这么多页数据
     * @param requestData 请求查询参数
     * @param dealReturnData 响应数据回调处理，对结果数据解析
     */
    $.fn.initPagination = function(requestUrl,pageNumName,pageCount,requestData,dealReturnData){
        _init($(this),pageCount);
        if(parseInt(pageCount) <= 0){
            return;
        }
        //初始化当前分页列表
        _initPageTags(1);
        if(requestUrl.length!=requestUrl.lastIndexOf('?')+1){//请求地址不以?结尾
            requestUrl += '?';
        }
        //附加页码参数
        var originUrl = requestUrl+'&'+pageNumName+'=';

        //分页页码绑定事件
        $(this).on('click','li a',function(){
            if($(this).text()=='...'){//忽略省略号
                return;
            }
            var currentTag = $(this);
            var currentPageNum = _getPageNum(currentTag);
            if(currentPageNum<=0){
                return;
            }
            var finalUrl = originUrl+currentPageNum;//附加页码值
            //console.log(finalUrl);
            $.ajax({
                url:finalUrl,
                data:requestData,
                type:'POST',
                dataType:'json',
                success:function(responseData){
                    _initPageTags(currentPageNum);
                    //回调函数解析结果数据
                    dealReturnData(responseData);
                }
            });
        })

    }

    /**
     * 与initPagination功能相同，只是请求的响应数据为HTML页面,并将结果放到container对应的元素中
     * @param requestUrl
     * @param pageNumName
     * @param pageCount
     * @param requestData
     * @param container 加载返回结果的元素
     * @param nowPage 默认选中的页码，=1时，可不用
     * @param callback 回调
     */
    $.fn.initPaginationLoadPage = function(requestUrl,pageNumName,pageCount,requestData,container, nowPage,callback){
        if(isNaN(pageCount)){
            pageCount = 0;
        }
        _init($(this),pageCount);
        if(parseInt(pageCount) <= 0){
            return;
        }
        //初始化当前分页列表
        _initPageTags(nowPage);
        if(requestUrl.length!=requestUrl.lastIndexOf('?')+1){//请求地址不以?结尾
            requestUrl += '?';
        }
        //附加页码参数
        var originUrl = requestUrl+'&'+pageNumName+'=';
        //分页页码绑定事件
        $(this).on('click','li a',function(){
            var currentTag = $(this);
            if(currentTag.text()=='...'){//点击省略号或者当前页，
                return;
            }
            var currentPageNum = _getPageNum(currentTag);
            if(currentPageNum<=0){
                return;
            }
            var finalUrl = originUrl+currentPageNum;//附加页码值
            //console.log(finalUrl);
            $(container).fadeOut();
            $(container).load(finalUrl,requestData,function(){
                _initPageTags(currentPageNum);
                $(container).fadeIn();
                $('body').animate({scrollTop: '0px'}, 200);
                if(callback){
                    callback();
                }
            });
        });

    };
    function _init(container,pageCount){
        if(pageCount<=0){
            container.html('没有数据');
        }else{
            container.empty();
            //解绑上次绑定的事件
            container.off('click','li a');
            _paginationConfig.pageCount = parseInt(pageCount);
            _paginationConfig.container = container;
            _paginationConfig.showAll = parseInt(pageCount)<=_paginationConfig.tagsTotal;
        }
    }
    /**
     * 根据点击的分页标签，计算分页的页码。以下情况返回0
     * 1、点击当前active页码
     * 2、当前active页码为第一页时，点击【前一页】
     * 2、当前active页码为最后一页时，点击【后一页】
     * @param pageTag
     * @private
     */
    function _getPageNum(pageTag){
        var pageNum = parseInt(pageTag.text());
        var currentNum = pageTag.closest('ul.pagination').find('li.active').text();
        currentNum = parseInt(currentNum);
        if(pageNum > 0){//数字页码
            return pageNum==currentNum?0:pageNum;
        } else{//上一页或下一页
            var pageTagName = pageTag.attr('name');
            if(pageTagName == 'pre'){
                return currentNum<=1?0:currentNum-1;
            } else if(pageTagName == 'next'){
                return currentNum>=_paginationConfig.pageCount?0:currentNum+1;
            }
        }
    }
    //分页配置
    var _paginationConfig= {
        tagsTotal:9,  //最多显示的分页标签数
        pageCount:0, //总页数
        showAll:false,//显示全部分页标签
        container:null //显示分页标签的容器
    };

    /**
     * 根据当前选中的页码初始化分页标签列表
     * @param pageNum
     * @private
     */
    function _initPageTags(pageNum){
        var ulTag = $('<ul class="pagination"></ul>');
        var prePageTag = $('<li><a href="#" name="pre"><span>上一页</span></a></li>');
        var tagsCenter = _paginationConfig.tagsTotal-4;
        ulTag.append(prePageTag);
        //计算页码
        if(_paginationConfig.showAll){//显示全部页码，中间没有省略号
            for(var i =1; i<=_paginationConfig.pageCount;i++){
                if(i==pageNum){
                    ulTag.append('<li class="active"><a href="#">'+i+'</a></li>');
                } else{
                    ulTag.append('<li><a href="#">'+i+'</a></li>');
                }

            }
        } else if(pageNum-1<=(tagsCenter+1)/2){//只有右边有省略的页码
            for(var i=1;i<=tagsCenter+2;i++){
                if(i==pageNum){
                    ulTag.append('<li class="active"><a href="#">'+i+'</a></li>');
                } else{
                    ulTag.append('<li><a href="#">'+i+'</a></li>');
                }
            }
            ulTag.append('<li><a href="#">...</a></li>');
            ulTag.append('<li><a href="#">'+_paginationConfig.pageCount+'</a></li>');

        } else if(_paginationConfig.pageCount-pageNum<=(tagsCenter+1)/2){//只有左边有省略的页码
            ulTag.append('<li><a href="#">1</a></li>');
            ulTag.append('<li><a href="#">...</a></li>');
            var beginNum = _paginationConfig.pageCount-tagsCenter-1;
            for(var i=beginNum;i<=_paginationConfig.pageCount;i++){
                if(i==pageNum){
                    ulTag.append('<li class="active"><a href="#">'+i+'</a></li>');
                } else{
                    ulTag.append('<li><a href="#">'+i+'</a></li>');
                }
            }
        } else{//两边都有省略的页码
            ulTag.append('<li><a href="#">1</a></li>');
            ulTag.append('<li><a href="#">...</a></li>');
            var step = (tagsCenter-1)/2;
            for(var i=pageNum-step;i<=pageNum+step;i++){
                if(i==pageNum){
                    ulTag.append('<li class="active"><a href="#">'+i+'</a></li>');
                } else{
                    ulTag.append('<li><a href="#">'+i+'</a></li>');
                }
            }
            ulTag.append('<li><a href="#">...</a></li>');
            ulTag.append('<li><a href="#">'+_paginationConfig.pageCount+'</a></li>');
        }


        var nextPageTag = $('<li><a href="#" name="next"><span>下一页</span></a></li>');
        ulTag.append(nextPageTag);
        var navTag = $('<nav></nav>');
        navTag.append(ulTag);
        _paginationConfig.container.empty();
        _paginationConfig.container.append(navTag);
    }

}(jQuery));