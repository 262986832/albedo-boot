var albedoForm = function () {
    var _treeSearchInputFocusKey = function ($key) {
        if ($key.hasClass("empty")) {
            $key.removeClass("empty");
        }
    }
    var _treeSearchInputBlurKey = function ($key, tree) {
        if ($key.get(0).value === "") {
            $key.addClass("empty");
        }
        _treeSearchNode($key, tree);
    }
    var _treeSearchNode = function ($key, tree) {
        var $container = tree.setting.treeObj;
        // 取得输入的关键字的值
        var value = $.trim($key.get(0).value);
        // 按名字查询
        var keyType = "name";
        if ($key.hasClass("empty")) {
            value = "";
        }
        // 如果和上次一次，就退出不查了。
        if ($key.attr("lastValue_") === value) {
            return;
        }
        // 保存最后一次
        $key.attr("lastValue_", value);
        console.log(value)
        // 如果要查空字串，就退出不查了。
        if (value === "") {
            {
                $container.mCustomScrollbar({
                    'scrollTo': 0
                });
            }
            return;
        }
        _treeSearchUpdateNodes(tree, false, tree.transformToArray(tree.getNodes()));
        _treeSearchUpdateNodes(tree, true, tree.getNodesByParamFuzzy(keyType, value, null));
    }
    var _treeSearchUpdateNodes = function (tree, highlight, nodeList) {
        var $container = tree.setting.treeObj;
        for (var i = 0, l = nodeList.length; i < l; i++) {
            console.log(nodeList[i])
            nodeList[i].highlight = highlight;
            tree.updateNode(nodeList[i]);
            tree.expandNode(nodeList[i].getParentNode(), true, false, true);
            if (i == 0 && highlight) {
                var scorll = $("a[title='" + nodeList[i].name + "']").offset().top - $container.offset().top - 5;
//				$container.animate({scrollTop: scorll},500)
                $container.mCustomScrollbar({
                    'scrollTo': scorll
                });
            }
        }
    }
    var _mapData={};
    var _getData = function (key) {
        return _mapData ? _mapData[key] : null;
    }
    var _setData = function (key, data) {
        _mapData[key] = data;
    }
    /**public**/

    var treeShow = function ($thiz) {
        var name = $thiz.attr("name"),
            url = $thiz.attr("_url") ? $thiz.attr("_url") : "",
            checked = $thiz.attr("_checked") == "true" ? true : false,
            onlyCheckedChild = $thiz.attr("_onlyCheckedChild") ? $thiz.attr("_onlyCheckedChild") : false,
            onlyCheckedProperty = $thiz.attr("_onlyCheckedProperty") ? $thiz.attr("_onlyCheckedProperty") : false,
            checkIdInputName = $thiz.attr("_checkIdInputName") ? $thiz.attr("_checkIdInputName") : "",
            checkShowInputId = $thiz.attr("_checkShowInputId") ? $thiz.attr("_checkShowInputId") : "",
            notAllowSelectRoot = $thiz.attr("_notAllowSelectRoot") ? $thiz.attr("_notAllowSelectRoot") : false,
            notAllowSelectParent = $thiz.attr("_notAllowSelectParent") ? $thiz.attr("_notAllowSelectParent") : false,
            notAllowSelect = $thiz.attr("_notAllowSelect") ? $thiz.attr("_notAllowSelect") : false,
            allowCancelSelect = $thiz.attr("_allowCancelSelect") ? $thiz.attr("_allowCancelSelect") : false,
            nodesLevel = $thiz.attr("_nodesLevel") ? $thiz.attr("_nodesLevel") : "",
            afterLoadNodeFn = $thiz.attr("_afterLoadNodeFn") ? $thiz.attr("_afterLoadNodeFn") : "",
            clickNodeFn = $thiz.attr("_clickNodeFn") ? $thiz.attr("_clickNodeFn") : "",
            cancelClickNodeFn = $thiz.attr("_cancelClickNodeFn") ? $thiz.attr("_cancelClickNodeFn") : "",
            beforeCheckNodeFn = $thiz.attr("_beforeCheckNodeFn") ? $thiz.attr("_beforeCheckNodeFn") : "",
            checkNodeFn = $thiz.attr("_checkNodeFn") ? $thiz.attr("_checkNodeFn") : "";

        var $key, lastValue_ = "", nodeList = [];
        var tree, setting = {
            view: {
                selectedMulti: false, fontCss: function (treeId, treeNode) {
                    return (!!treeNode.highlight) ? {"font-weight": "bold"} : {"font-weight": "normal"};
                }
            },
            check: {enable: checked, nocheckInherit: true},
            data: {key: {name: 'label'}, simpleData: {enable: true, idKey: 'id', pIdKey: 'pid'}},
            callback: {
                beforeClick: function (treeId, treeNode) {
                    if (allowCancelSelect && tree && tree.getSelectedNodes()[0] && tree.getSelectedNodes()[0].id == treeNode.id) {
                        tree.cancelSelectedNode();
                        var cancelClickNodeFnName;
                        console.log(cancelClickNodeFn)
                        cancelClickNodeFn && cancelClickNodeFn.indexOf("function")!=1 && eval("cancelClickNodeFnName = "+cancelClickNodeFn);
                        if ((typeof cancelClickNodeFnName) == "function") {
                            var param = [treeId, treeNode];
                            cancelClickNodeFnName.apply(tree, param);
                        }
                        // eval((cancelClickNodeFnName?cancelClickNodeFnName:cancelClickNodeFn) + "();")
                        return false;
                    } else if (notAllowSelect) {
                        return false;
                    } else if (!notAllowSelect && notAllowSelectRoot && treeNode.level == 0) {
                        toastr.warning("不能选择根节点（" + treeNode.name + "）请重新选择。");
                        return false;
                    } else if (!notAllowSelect && notAllowSelectParent && treeNode.isParent) {
                        toastr.warning("不能选择父节点（" + treeNode.name + "）请重新选择。");
                        return false;
                    } else {
                        return true;
                    }
                }

            }
        };

        console.log(clickNodeFn);
        try{
            clickNodeFn && eval("setting.callback.onClick = " + clickNodeFn);
        }catch(e){
            console.log(e);}
        try{
            beforeCheckNodeFn && eval("setting.callback.beforeCheck = " + beforeCheckNodeFn);
        }catch(e){}
        try{
            checkNodeFn && eval("setting.callback.onCheck = " + checkNodeFn);
        }catch(e){}
        if (checked && !checkNodeFn && checkShowInputId) {
            var _checkedNode_ = function (treeNode, showInput, showName) {
                if (treeNode.checked) {
                    if (!showName) showName = treeNode.name;
                    else showName = showName + "," + treeNode.name;
                    if (checkIdInputName) showInput.after($('<input type="hidden" name="' + checkIdInputName + '" />').val(treeNode.id));
                }
                return showName;
            }
            setting.callback.onCheck = function (event, treeId, treeNode, clickFlag) {
                var showInput = $("#" + checkShowInputId), showName = showInput.val();
                if (tree) {
                    nodes = tree.getCheckedNodes(), showName = "", eval("flag = ((onlyCheckedProperty && nodes[i]." + onlyCheckedProperty + ") || !onlyCheckedProperty)")
                    if (checkIdInputName) $("input[name='" + checkIdInputName + "']").remove();
                    if (nodes && nodes.length > 0) {
                        for (var i = 0; i < nodes.length; i++) {
                            if (!nodes[i].getCheckStatus().half && ((onlyCheckedChild && !nodes[i].isParent) || !onlyCheckedChild) && flag) {
                                showName = _checkedNode_(nodes[i], showInput, showName);
                            }
                        }
                    }
                }
                showInput.val(showName);
            };
        }
        var refreshTree = function () {
            $.get(url, function (rs) {
                if (rs && rs.status != 1) {
                    toastr.warning(rs.message);
                    return;
                }
                var zNodes = rs.data;
                tree = $.fn.zTree.init($thiz, setting, zNodes);
                if (nodesLevel) for (var i = 0; i < nodesLevel; i++) {
                    var nodes = tree.getNodesByParam("level", i);
                    for (var j = 0; j < nodes.length; j++) {
                        tree.expandNode(nodes[j], true, false, true);
                    }
                }
                if (!nodesLevel) tree.expandAll(true);
                if (checkIdInputName) $("input[name='" + checkIdInputName + "']").each(function () {
                    if ($(this).val()) {
                        var node = tree.getNodeByParam("id", $(this).val());
                        if (node) tree.checkNode(node, true, true);
                    }
                });
                var selectNodeId = $thiz.attr("_selectNodeId") ? $thiz.attr("_selectNodeId") : "",selectId;
                try{
                    eval("if("+selectNodeId+"){var selectId=" + selectNodeId+"}");
                }catch(e){}
                if (selectId) {
                    var node = (selectId == 1 ? tree.getNodes()[0] : tree.getNodeByParam("id", selectId));
                    tree.selectNode(node);
                }
            });
        }
        console.log(albedo.getToken())
        if(albedo.getToken()){
            refreshTree();
        }else{
            // while(!albedo.getToken()){
                setTimeout(function () {
                    console.log(albedo.getToken())
                    albedo.getToken() && refreshTree()
                }, 1000)
            // }
        }
        $thiz.prev("div").find("input").bind("focus", function () {
            _treeSearchInputFocusKey($(this));
        }).bind("blur", function () {
            _treeSearchInputBlurKey($(this), tree);
        })
            .bind("change keydown cut input propertychange", function () {
                _treeSearchNode($(this), tree);
            });
        var $portlet = $thiz.parents(".m-portlet");
        $portlet.find("a.tree-search").off("click").click(function () {
            $portlet.find(".tree-search-div").slideToggle(200);
            $portlet.find(".tree-search-input").focus();
        });
        $portlet.find("a.tree-refresh").off("click").click(function () {
            refreshTree();
        });
        $portlet.find("a.tree-expand").off("click").click(function () {
            var zTree = $.fn.zTree.getZTreeObj($thiz.attr("id"));
            var expand = ($(this).find("i").attr("class").indexOf("expand") == -1);
            $(this).find("i").attr("class", "fa fa-" + (expand == true ? "expand" : "compress"));
            zTree.expandAll(expand);
        });

    };

    var handleTreeSelect = function ($thiz, $thizVal) {
        // 是否限制选择，如果限制，设置为disabled
        if ($thizVal.attr("disabled")) {
            return true;
        }

        var name = $thiz.attr("name"), nameLevel = $thiz.attr("_nameLevel"), nameLevel = (nameLevel ? nameLevel : "1"),
            url = $thiz.attr("_url") ? $thiz.attr("_url") : "",
            module = $thiz.attr("_module") ? $thiz.attr("_module") : "",
            checked = $thiz.attr("_checked") == "true" ? $thiz.attr("_checked") : "",
            extId = $thiz.attr("_extId") ? $thiz.attr("_extId") : "",
            nodesLevel = $thiz.attr("_nodesLevel") ? $thiz.attr("_nodesLevel") : "",
            title = $thiz.attr("_title") ? $thiz.attr("_title") : "",
            value = $thizVal.val() ? $thizVal.val() : "",
            allowClear = $thiz.attr("_allowClear") ? $thiz.attr("_allowClear") : "",
            notAllowSelectParent = $thiz.attr("_notAllowSelectParent") ? $thiz.attr("_notAllowSelectParent") : "",
            dialogWidth = $thiz.attr("_dialogWidth") ? $thiz.attr("_dialogWidth") : 320,
            dialogHeight = $thiz.attr("_dialogHeight") ? $thiz.attr("_dialogHeight") : 360,
            notAllowSelectRoot = $thiz.attr("_notAllowSelectRoot") ? $thiz.attr("_notAllowSelectRoot") : "",
            selectScopeModule = $thiz.attr("_selectScopeModule") ? $thiz.attr("_selectScopeModule") : "",
            selectedValueFn = $thiz.attr("_selectedValueFn") ? $thiz.attr("_selectedValueFn") : "",
            saveHalfState = $thiz.attr("_saveHalfState") ? $thiz.attr("_saveHalfState") : "";

        if (name && name.indexOf(".") != -1) name = name.replace(".", "-");

        var html = '<div id="' + name + 'TreeModal" class="modal fade" tabindex="-1" data-focus-on="input:first">' +
            '<div class="modal-dialog modal-sm" role="document">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>' +
            '<h4 class="modal-title">' + (title ? title : "数据选择") + '</h4>' +
            '</div>' +
            '<div class="modal-body albedo-treeSelect-div albed-treeSelect-' + name + '">' +
            '<div class="search-item-div" style="position:absolute;right:15px;top:20px;cursor:pointer;z-index:22;">' +
            '<i class="fa fa-search icon-on-right fa-lg"></i><label id="txt">&nbsp;&nbsp;</label>' +
            '</div>' +
            '<div id="search" class="control-group" style="padding:0px 0 0px 15px;display: none;">' +
            '<div class="portlet-input input-inline" style="width: 240px !important;">' +
            '<div class="input-icon right">' +
            '<i class="icon-magnifier"></i>' +
            '<input type="text" id="key" name="key" maxlength="50" class="form-control input-circle" placeholder="请输入..."> </div>' +
            '</div>' +
            '</div>' +
            '<div id="tree-' + name + '" class="ztree scroller" style="padding:0 15px 10px;height:' + (dialogHeight - 30) + 'px;"></div>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-sm btn-primary m-btn m-btn--custom confirm">确定</button>' +
            '<button type="button" class="btn btn-sm btn-secondary m-btn m-btn--custom" data-dismiss="modal">关闭</button>' +
            (allowClear ? '<button type="button" class="btn btn-sm btn-warning m-btn m-btn--custom clear">清除</button>' : '') +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        var $modal = $(html), lastValue = "", nodeList = [];
        var setting = {
            check: {enable: checked, nocheckInherit: true},
            data: {key: {name: 'label'}, simpleData: {enable: true, idKey: 'id', pIdKey: 'pid'}},
            view: {
                selectedMulti: false,
                fontCss: function (treeId, treeNode) {
                    return (!!treeNode.highlight) ? {"font-weight": "bold"} : {"font-weight": "normal"};
                }
            },
            callback: {
                beforeClick: function (id, node) {
                    if (checked == "true") {
                        tree.checkNode(node, !node.checked, true, true);
                        return false;
                    }
                }, onDblClick: function () {
                    $modal.find('.confirm').trigger("click");
                }
            }
        };
        $.get(url + (url.indexOf("?") == -1 ? "?" : "&") + "extId=" + extId + "&module=" + module + "&t=" + new Date().getTime(), function (rs) {
            if (rs && rs.status != 1) {
                toastr.warning(rs.message);
                return;
            }
            var zNodes = rs.data;
            // 初始化树结构
            var tree = $.fn.zTree.init($modal.find("#tree-" + name), setting, zNodes);
            // 默认指定层级节点
            if (nodesLevel) {
                for (var i = 0; i < nodesLevel; i++) {
                    var nodes = tree.getNodesByParam("level", i);
                    for (var i = 0; i < nodes.length; i++) {
                        tree.expandNode(nodes[i], true, false, false);
                    }
                }
            } else {
                tree.expandAll(true);// 默认全部节点
            }
            // 默认选择节点
            var ids = value.split(",");
            for (var i = 0; i < ids.length; i++) {
                var node = tree.getNodeByParam("id", ids[i]);
                if (checked == "true") {
                    try {
                        tree.checkNode(node, true, true);
                    } catch (e) {
                    }
                    tree.selectNode(node, false);
                } else {
                    tree.selectNode(node, true);
                }
            }
        });
        $modal.find("#key").bind("focus", function (e) {
            _treeSearchInputFocusKey($(this));
        }).bind("blur", function (e) {
            _treeSearchInputBlurKey($(this), $.fn.zTree.getZTreeObj("tree-" + name));
        }).bind("change keydown cut input propertychange", function () {
            _treeSearchNode($(this), $.fn.zTree.getZTreeObj("tree-" + name));
        });
        $modal.find(".search-item-div").click(function () {
            $modal.find("#search").slideToggle(200);
            $modal.find("#txt").toggle();
            $modal.find("#key").focus();
        });
        //, maxHeight: dialogHeight, height: dialogHeight
        $modal.modal({width: dialogWidth}).off('click', '.confirm').on('click', '.confirm', function () {
            var tree = $.fn.zTree.getZTreeObj("tree-" + name);
            var ids = [], names = [], nodes = [];
            if (checked == "true") {
                nodes = tree.getCheckedNodes(true);
            } else {
                nodes = tree.getSelectedNodes();
            }
            for (var i = 0; i < nodes.length; i++) {
                if (checked == "true") {
                    if (notAllowSelectParent && nodes[i].isParent) {
                        continue; // 如果为复选框选择，则过滤掉父节点
                    }
                    if (nodes[i].getCheckStatus().half) {
                        continue; // 过滤半选中状态
                    }
                }
                if (notAllowSelectRoot && nodes[i].level == 0) {
                    toastr.warning("不能选择根节点（" + nodes[i].name + "）请重新选择。");
                    return false;
                }
                if (notAllowSelectParent && nodes[i].isParent) {
                    toastr.warning("不能选择父节点（" + nodes[i].name + "）请重新选择。");
                    return false;
                }
                if (!module && selectScopeModule) {
                    if (nodes[i].module == "") {
                        toastr.warning("不能选择公共模型（" + nodes[i].name + "）请重新选择。");
                        return false;
                    } else if (nodes[i].module != module) {
                        toastr.warning("不能选择当前栏目以外的栏目模型，请重新选择。");
                        return false;
                    }
                }
                ids.push(nodes[i].id);
                var t_node = nodes[i];
                var t_name = "";
                var name_l = 0;
                do {
                    name_l++;
                    t_name = t_node.label + " " + t_name;
                    t_node = t_node.getParentNode();
                } while (name_l < nameLevel);
                names.push(t_name);
                if (checked != "true") break; // 如果为非复选框选择，则返回第一个选择
            }
            $thizVal.val(ids);
            $thiz.val(names);
            if (albedo.isExitsVariable(selectedValueFn) && albedo.isExitsFunction(selectedValueFn)) {
                eval(selectedValueFn + "('" + ids + "','" + names + "')");
            }
            $modal.modal("hide");
        });
        // App.initSlimScroll('.scroller');
        if (allowClear) {
            $modal.off('click', '.clear').on('click', '.clear', function () {
                $thizVal.val("");
                $thiz.val("");
                $modal.modal("hide");
            });
        }
    };

    var $tempStoreForm;

    var handleGridSelect = function ($thiz, $thizVal) {
        // 是否限制选择，如果限制，设置为disabled
        if ($thizVal.attr("disabled")) {
            return true;
        }

        var name = $thiz.attr("name"), id = $thizVal.attr("id"), colNames = $thiz.attr("_colNames"),
            gridOptions = $thiz.attr("_gridOptions"), colModel = $thiz.attr("_colModel"),
            searchFormId = $thiz.attr("_searchFormId"),
            url = $thiz.attr("_url") ? $thiz.attr("_url") : "",
            checked = $thiz.attr("_checked") == "true" ? true : false,
            disableDblClickRow = $thiz.attr("_disableDblClickRow") == "true" ? true : false,
            extId = $thiz.attr("_extId") ? $thiz.attr("_extId") : "",
            width = $thiz.attr("_width") ? $thiz.attr("_width") : 920,
            height = $thiz.attr("_height") ? $thiz.attr("_height") : 735,
            pageSize = $thiz.attr("_pageSize") ? $thiz.attr("_pageSize") : 10,
            title = $thiz.attr("_title") ? $thiz.attr("_title") : "",
            value = $thizVal.val() ? $thizVal.val() : "",
            allowClear = $thiz.attr("_allowClear") ? $thiz.attr("_allowClear") : "",
            showProperty = $thiz.attr("_showProperty") ? $thiz.attr("_showProperty") : "name",
            selectedValueFn = $thiz.attr("_selectedValueFn") ? $thiz.attr("_selectedValueFn") : "",
            grid_select_ = "#" + id + '-grid-table', pager_select_ = "#" + id + '-grid-pager';

        if (name && name.indexOf(".") != -1) name = name.replace(".", "-");

        var thStr = "";
        if (colNames) {
            var thOption = eval(colNames);
            for (var i = 0; i < thOption.length; i++) {
                var th = thOption[i];
                if (th && th.name) {
                    thStr += ("<th" + (th.width ? " width=" + th.width : "") + (th.cssClass ? " class=" + th.cssClass : "") + ">" + th.name + "</th>");
                } else if (th && typeof(th) == "string") {
                    thStr += ("<th>" + th + "</th>");
                }
            }
        }

        var html = '<div id="' + name + 'GridModal" class="modal modal-dialog fade" tabindex="-1" data-focus-on="input:first">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>' +
            '<h4 class="modal-title">' + (title ? title : "数据选择") + '</h4>' +
            '</div>' +
            '<div class="modal-body albedo-gridSelect-div albed-gridSelect-' + name + '">' +
            '<hr /><div id="bootstrap-alerts"></div>' +
            '<table class="table table-striped table-bordered table-hover dataTable no-footer dt-responsive" id="data-table-' + id + '"><thead>' +
            '<tr role="row" class="heading">' + thStr +
            '</tr></thead>' +
            '</table>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn blue confirm">确定</button>' +
            '<button type="button" class="btn default" data-dismiss="modal">关闭</button>' +
            (allowClear ? '<button type="button" class="btn blue clear">清除</button>' : '') +
            '</div>' +
            '</div>';
        var $modal = $(html);
        var ids = [], names = [], nodes = [];

        if ($(searchFormId).find("form") && $(searchFormId).find("form").length > 0) {
            $tempStoreForm = $(searchFormId).find("form").clone(true);
        }

        $modal.modal({width: width}).find(".albedo-gridSelect-div").prepend($tempStoreForm);

        App.initUniform($modal.find(":radio, :checkbox"));

        var $tableTarget = $modal.find("#data-table-" + id);
        var gridSelect = new Datatable();
        try {
            eval("gridOptions=" + gridOptions);
        } catch (e) {
        }
        gridOptions = $.extend(true, {
            "formSearch": $modal.find(".form-search"),
            "ajax": {
                "url": url,
                type: 'GET',
                "dataType": 'json'
            },
            "dom": "<'table-scrollable't><'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>",
            "columns": eval(colModel),
            "rowCallback": function (row, data) {
                if (value) {
                    var selected = value.split(",");
                    if ($.inArray(data.id, selected) !== -1) {
                        $(row).addClass('selected');
                        ids.push(data.id);
                        names.push(eval("data." + showProperty));
                        nodes.push(data);
                    }
                }
            }
        }, gridOptions);

        gridSelect.init({
            src: $tableTarget,
            dataTable: gridOptions
        });

        $tableTarget.on('xhr.dt', function (e, settings, rsData, xhr) {
            $modal.find("#data-table-" + id + ' tbody').off('click', 'tr').on('click', 'tr', function () {
                var id = this.id;
                if (!checked) {
                    ids = [], names = [], nodes = [];
                }
                if (checked && $(this).attr("class").indexOf("selected") != -1) { //取消 选择
                    ids.removeByValue(id);
                    for (var index = 0; index < rsData.data.length; index++) {
                        var item = rsData.data[index];
                        if (item.id == id) {
                            names.removeByValue(eval("item." + showProperty));
                            nodes.removeByValue(item);
                            break;
                        }
                    }
                } else {
                    ids.push(id);
                    for (var index = 0; index < rsData.data.length; index++) {
                        var item = rsData.data[index];
                        if (item.id == id) {
                            eval("names.push(item." + showProperty + ")");
                            nodes.push(item);
                        }
                    }
                }
                if (!checked) {
                    $(this).parents('tbody').find('tr').removeClass("selected");
                }
                $(this).toggleClass('selected');
            })
            $modal.find("#data-table-" + id + ' tbody').off('dblclick', 'tr').on('dblclick', 'tr', function () {
                var id = this.id;
                if (!checked && !disableDblClickRow && rsData) {
                    var ids = [], names = [], nodes = [];
                    ids.push(id);
                    for (var index = 0; index < rsData.data.length; index++) {
                        var item = rsData.data[index];
                        if (item.id == id) {
                            eval("names.push(item." + showProperty + ")");
                            nodes.push(item);
                        }
                    }
                    $thizVal.val(ids);
                    $thiz.val(names);
                    if (albedo.isExitsVariable(selectedValueFn) && albedo.isExitsFunction(selectedValueFn)) {
                        eval(selectedValueFn + "('" + ids + "','" + names + "',nodes)");
                    }
                    $modal.modal("hide");
                }
            });
            albedoForm.init($modal);
        })


        $modal.off('click', '.filter-submit-table').on('click', '.filter-submit-table', function () {
            gridSelect.submitFilter();
        }).off('click', '.confirm').on('click', '.confirm', function () {
            if (checked) {
                if (ids.length <= 0) {
                    toastr.warning("请至少选择一条数据");
                    return false;
                }
            } else {
                if (ids.length != 1) {
                    toastr.warning("请选择一条数据");
                    return false;
                }
            }
            $thizVal.val(ids);
            $thiz.val(names);
            if (albedo.isExitsVariable(selectedValueFn) && albedo.isExitsFunction(selectedValueFn)) {
                eval(selectedValueFn + "('" + ids + "','" + names + "',nodes)");
            }
            $modal.modal("hide");
        });
//		App.initSlimScroll('.scroller');
        if (allowClear) {
            $modal.off('click', '.clear').on('click', '.clear', function () {
                $thizVal.val("");
                $thiz.val("");
                $modal.modal("hide");
            });
        }
    };
    var handleDateTimePicker = function ($target) {

        if (!jQuery().datetimepicker) {
            return;
        }
        $target = ($target && $target.length > 0) ? $target.find('.date-time-picker') : $('.date-time-picker');
        $target.each(function () {
            var $tempInput = $target.find("input");
            eval("var options=" + ($tempInput && $tempInput.length > 0 ? $tempInput.attr("options") : $(this).attr("options")));
            // default settings
            options = $.extend(true, {
                language: 'zh-CN',
                autoclose: true,
                isRTL: App.isRTL(),
                format: "yyyy-mm-dd hh:ii:ss",
                pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left")
            }, options);
            // $("div.datetimepicker.dropdown-menu").remove();
            $(this).off("click");
            $(this).datetimepicker("remove").datepicker("remove");
            $(this).datetimepicker(options);
        });
        $('body').removeClass("modal-open"); // fix bug when inline picker is used in modal
    }
    var handleDatePicker = function ($target) {
        $target = ($target && $target.length > 0) ? $target.find('.date-picker') : $('.date-picker');
        $target.each(function () {
            var $tempInput = $target.find("input");
            eval("var options=" + ($tempInput && $tempInput.length > 0 ? $tempInput.attr("options") : $(this).attr("options")));
            // default settings
            options = $.extend(true, {
                language: 'zh-CN',
                autoclose: true,
                isRTL: App.isRTL(),
                format: "yyyy-mm-dd"
            }, options);
            // $("div.datetimepicker.dropdown-menu").remove();
            $(this).datetimepicker("remove").datepicker("remove");
            $(this).datepicker(options);
        });
    };

    var handleSummernote = function ($target) {
        $target = ($target && $target.length > 0) ? $target.find('.summernote') : $('.summernote');
        $target.each(function () {
            var $tempInput = $target.find("input");
            var options = {};
            eval("options=" + ($tempInput && $tempInput.length > 0 ? $tempInput.attr("options") : $(this).attr("options")));
            // default settings
            var $thiz = $(this),placeholder = $thiz.attr("placeholder") || '',url = $thiz.attr("action") || '';
            options = $.extend(true, {
                lang : 'zh-CN',
                placeholder : placeholder,
                minHeight : 300,
                dialogsFade : true,// Add fade effect on dialogs
                dialogsInBody : true,// Dialogs can be placed in body, not in
                // summernote.
                disableDragAndDrop : false,// default false You can disable drag
                // and drop
                // callbacks : {
                //     onImageUpload : function(files) {
                //         var $files = $(files);
                //         $files.each(function() {
                //             var file = this;
                //             var data = new FormData();
                //             data.append("file", file);
                //
                //             $.ajax({
                //                 data : data,
                //                 type : "POST",
                //                 url : url,
                //                 cache : false,
                //                 contentType : false,
                //                 processData : false,
                //                 success : function(response) {
                //                     var json = YUNM.jsonEval(response);
                //                     YUNM.debug(json);
                //                     YUNM.ajaxDone(json);
                //
                //                     if (json[YUNM.keys.statusCode] == YUNM.statusCode.ok) {
                //                         // 文件不为空
                //                         if (json[YUNM.keys.result]) {
                //                             var imageUrl = json[YUNM.keys.result].completeSavePath;
                //                             $this.summernote('insertImage', imageUrl, function($image) {
                //
                //                             });
                //                         }
                //                     }
                //
                //                 },
                //                 error : YUNM.ajaxError
                //             });
                //         });
                //     }
                // }
            }, options);
            setTimeout(function () {
                $thiz.summernote(options);
            },100)
        });
    };
    var handleFormValueInit = function ($target) {
        $target = ($target && $target.length > 0) ? $target.find('alb-form') : $('alb-form');
        $target.each(function () {
            var $thiz = $(this);
            // $("div.datetimepicker.dropdown-menu").remove();
            var ngValue = $thiz.attr("ng-reflect-value"), boxtype=$thiz.attr("boxtype");
            console.log(ngValue);
            if(ngValue){
                if(boxtype=="checkbox" || boxtype == "radio"){
                    $thiz.find("input[type='"+boxtype+"']").removeAttr("checked");
                    $thiz.find("input[type='"+boxtype+"'][value='"+ngValue+"']").attr("checked", "checked")
                }else if(boxtype=="select"){
                    $thiz.find("select option").removeAttr("selected");
                    $thiz.find("select option[value='"+ngValue+"']").attr("selected", "selected");
                }
            }
        });
    };

    var handleFileUpload = function ($target) {
        $target = ($target && $target.length > 0) ? $target.find('input[type="file"]') : $('input[type="file"]');
        var clearVal = function () {
            var $parent = $(this).parents(".fileinput");
            var $file = $parent.find("input[type='hidden']");
            var tempVal = "," + $file.val() + ",";
            tempVal = tempVal.replace($(this).attr("img-value") + ",", "");
            tempVal = tempVal.length > 2 ? tempVal.substring(1, tempVal.length - 1) : "";
            $file.val(tempVal);
            $(this).parent(".fileinput-preview").remove();
            if (tempVal == "") {
                $parent.attr("class", "fileinput fileinput-new");
            }
        };


        $target.length > 0 && $target.fileupload && $target.each(function () {
            var options = $(this).attr("options"), $parent = $(this).parents(".fileinput"),
                multiple = $(this).attr("multiple"), showType = $(this).attr("showType");

            options = $.extend(true, {
                autoUpload: true,
                singleFileUploads: false,
                url: App.getCtxPath() + "/file/upload",
                type: "POST",
                dataType: 'json',
                done: function (e, data) {
                    if (data && data.result && data.result.status == 1) {
                        var files = data.result.data;
                        var $preview = $parent.find(".btn-img-div");
                        if ("image" == showType) {
                            $parent.find(".fileinput-exists.fileinput-preview").remove();
                            if (multiple) {
                                var fileVal = $parent.find("input[type='hidden']").val();
                                $parent.find("input[type='hidden']").val(fileVal && fileVal.length > 0 ? (fileVal + "," + files) : files);
                                fileVal = $parent.find("input[type='hidden']").val();
                                if (fileVal) {
                                    var fileArray = fileVal.split(',');
                                    for (var i = 0; i < fileArray.length; i++) {
                                        if (i < fileArray.length && fileArray[i] && typeof(fileArray[i]) == "string") $preview.before($("<div class=\"fileinput-preview fileinput-exists thumbnail\" ></div>").append(
                                            $("<img title='双击移除' src='" + App.getCtxPath() + "/file/get" + fileArray[i] + "' class=\"fileinput-img\" img-value=\"" + fileArray[i] + "\" />").dblclick(clearVal)));
                                    }
                                }
                            } else {
                                $preview.before($("<div class=\"fileinput-preview fileinput-exists thumbnail\" ></div>").append(
                                    $("<img title='双击移除' src='" + App.getCtxPath() + "/file/get" + files + "' class=\"fileinput-img\" img-value=\"" + files + "\" />").dblclick(clearVal)));
                                $parent.find("input[type='hidden']").val(files);
                            }
                        } else {
                            $parent.find(".form-control").attr("title", files).val(files);
                            $parent.find("input[type='hidden']").val(files);
                        }

                    } else {
                        toastr.warning(data.result.msg);
                    }
                }
            }, options);
            $(this).fileupload(options);
            var $parent = $(this).parents(".fileinput");
            $parent.find(".fileinput-remove").click(function () {
                $parent.find("input[type='hidden']").val('');
                if ("image" == showType) {
                    $parent.find(".fileinput-preview").remove();
                } else {
                    $parent.find(".form-control").attr("title", '').val('');
                }
            });
            $parent.find(".fileinput-img").dblclick(clearVal);

        });
    };

    var handleSave = function ($target, validateFun) {
        var $target = $target || $(".m-content");
        $target.off('click', '.save').on('click', '.save', function () {
            var el = $(this), $form = $target.find('.form-validation'),
                flag = true;
            if(!validateFun) validateFun = $form.attr("validateFun")
            if (doValidation($form)) {
                albedo.isExitsFunction(validateFun) && eval("flag = " + validateFun + "()");
                if (flag) {
                    // $target.modal('loading');
                    var url = $form.attr("action");
                    $.ajax({
                        url: url,
                        type: $form.attr("method") || "POST",
                        data: JSON.stringify($form.serializeObject()),
                        // data: self.getValue($form.serialize()),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        timeout: 60000,
                        success: function (re) {
                            alertDialog($target, re, el);
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            console.log(errorThrown);
                            alertDialog($target, null, el);
                        }
                    });
                }
            }
        });
    }


    var alertDialog = function ($modal, re, el) {
        var alertType = "warning", icon = "warning", isModal = el && el.data("is-modal") == true;
        try {
            $modal.modal('removeLoading');
        } catch (e) {
        }
        var isForm = $modal.find('.form-validation').length > 0;
        if (re && el) {
            var tableId = el.data("table-id"), refresh = el.data("refresh"), delay = el.data("delay"),
                alertType = re.status == "0" ? "info" : re.status == "1" ? "success" : re.status == "-1" ? "danger" : "warning";
            icon = re.status == "0" ? "info" : re.status == "1" ? "check" : "warning";
            // && (tableId || refresh)
            if (re.status == "1") {
                if (refresh) {
                    window.location.reload();
                } else {
                    if (!isModal) {
                        $modal.find(".list i").trigger("click");
                    }
                    if(tableId){
                        var dataTables = albedoList.getDataTable($(tableId).attr("id"));
                        if(dataTables){
                            if (delay) {
                                // $modal.modal('loading');
                                setTimeout(function () {
                                    dataTables.loadFilterGird();
                                    // $modal.modal('removeLoading');
                                }, delay)
                            } else {
                                dataTables.loadFilterGird();
                            }
                        }
                    }
                    var ajaxReloadAfterFu = el.data("reload-after");
                    if (albedo.isExitsFunction(ajaxReloadAfterFu)) {
                        eval(ajaxReloadAfterFu + "(re)");
                    }
                }
            }
        }
        if (isModal) $modal.modal('hide');
        setTimeout(function () {
            console.log($modal);
            mApp.alert({
                // container: $modal.find('#bootstrap-alerts'),
                close: true,
                focus: true,
                type: alertType,
                closeInSeconds: 8,
                message: (re && re.message) ? re.message : '网络异常，请检查您的网络!',
                icon: icon
            });
        },500)

    }


    var $form = $('.form-validation');

    var handleValidateConfig = function (config, form) {
        if (!config)
            config = {};
        config = $.extend(true, {
            // define validation rules
            rules: {},
            messages: {},
            //display error alert on form submit
            invalidHandler: function (event, validator) {
                // mApp.alert({
                //     container: '.m-form__content',
                //     type: 'warning',
                //     icon: 'warning',
                //     message: '验证失败'
                // });
            },
            submitHandler: function (form) {
                //form[0].submit(); // submit the form
            }
        }, config);
        return config;
    };
    // advance validation
    var handleValidation = function ($formTagert, options) {
        if ($formTagert && $formTagert.length > 0) {
            $form = $formTagert;
            var config;
            try {
                eval("config = " + $form.attr("config"));
            } catch (e) {
            }
            if (!config) config = {};
            config = $.extend(true, config, options);
            var validator = $formTagert.validate(handleValidateConfig(config, $formTagert));
            _setData($form.attr("id"), validator);
            // apply validation on select2 dropdown value change, this only needed
            // for chosen dropdown integration.
            $('.select2me', $formTagert).change(function () {
                $formTagert.validate().element($(this));
            });
            $form.find('.date-time-picker').change(function () {
                $formTagert.validate().element($(this));
            });
            return validator;
        }
    }
    var handleInitFormData = function ($form, data) {
        if ($form && $form.length > 0) {
            for(var o in data){
                var $target = $form.find("[name='"+o+"']"),val = data[o];
                if(!$target || $target.length<1){continue}
                if($target.is("input")){
                    var type = $target.attr("type");
                    if(type == "radio" || type == "checkbox"){
                        $target.removeAttr("checked");
                        if(val){
                            if(val.indexOf(",")!=-1){val = val.toString().split(",");}
                            if(val instanceof Array){
                                for(var o in val){
                                    $target.find("[value='"+val[o]+"']").attr("checked", "checked");
                                }
                            }else{
                                $target.find("[value='"+val+"']").attr("checked", "checked");
                            }
                        }
                    }else{
                        if(type != "password") $target.val(val ? val : null);
                    }
                }else if($target.is("textarea")){
                    $target.val(val);
                    $target.hasClass('summernote')&&$target.summernote('code', val);;
                }else if($target.is("select")){
                    $target.find("option").removeAttr("selected");
                    if(val){
                        if(val.toString().indexOf(",")!=-1){val = val.toString().split(",")};
                        if(val instanceof Array){
                            for(var o in val){
                                $target.find("option[value='"+val[o]+"']").attr("selected", "selected");
                            }
                        }else{
                            $target.find("option[value='"+val+"']").attr("selected", "selected");
                        }
                    }
                    $target.find('.m-bootstrap-select').selectpicker("val",val);
                }
            }
        }
    }

    var doValidation = function ($formTagert) {
        if ($formTagert && $formTagert.length > 0) {
            var validator =_getData($formTagert.attr("id"));
            return validator ? validator.form() : handleValidation($formTagert).form();
        }
        return false;
    }

    //* END:CORE HANDLERS *//

    return {
        initDateTimePicker: function ($target) {
            handleDateTimePicker($target);
        }, initDatePicker: function ($target) {
            handleDatePicker($target);
        }, gridSelect: function ($thiz, $thizVal) {
            handleGridSelect($thiz, $thizVal);
        }, treeSelect: function ($thiz, $thizVal) {
            handleTreeSelect($thiz, $thizVal);
        },
        initTree: function ($targetShowTree) {
            $targetShowTree = ($targetShowTree && $targetShowTree.length > 0) ? $targetShowTree.find(".ztree-show") : $(".ztree-show");
            $targetShowTree.each(function () {
                treeShow($(this));
            });
        },

        initFileUpload: function ($target) {
            handleFileUpload($target);
        },

        initSave: function ($target, validateFun) {
            handleSave($target, validateFun)
        },
        initFormData: function (selector, data) {
            _setData(selector, data)
        },
        resetForm: function (selector) {
            var data = _getData(selector);
            console.log(data);
            handleInitFormData($(selector), data)
        },
        alertDialog: function ($modal, re, el) {
            alertDialog($modal, re, el);
        },
        // main function to initiate the module
        initValidate: function ($formTagert, options) {
            handleValidation($formTagert, options);
        },
        validate: function ($formTagert) {
            return doValidation($formTagert);
        },
        //main function to initiate the theme
        init: function ($target) {
            handleDateTimePicker($target);
            handleDatePicker($target);
            handleFileUpload($target);
            handleSummernote($target);
            // handleFormValueInit($target);
            albedoForm.initTree($target);
        }
    }
}();
// jQuery(document).ready(function () {
//     albedoForm.init(); // init core componets
// });

