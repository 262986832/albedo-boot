package com.albedo.java.modules.sys.service;

import com.albedo.java.common.data.persistence.BaseEntity;
import com.albedo.java.common.service.TreeService;
import com.albedo.java.modules.sys.domain.Dict;
import com.albedo.java.modules.sys.repository.DictRepository;
import com.albedo.java.util.PublicUtil;
import com.albedo.java.vo.sys.query.DictTreeQuery;
import com.albedo.java.vo.sys.query.DictResult;
import com.albedo.java.vo.sys.query.DictTreeResult;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Service class for managing dicts.
 */
@Service
@Transactional
public class DictService extends TreeService<DictRepository, Dict, String> {

    @Transactional(readOnly = true)
    public List<DictTreeResult> findTreeDataRest(DictTreeQuery dictTreeQuery, List<Dict> dictList) {
        String type = dictTreeQuery != null ? dictTreeQuery.getType() : null, all = dictTreeQuery != null ? dictTreeQuery.getAll() : null;
        List<DictTreeResult> mapList = Lists.newArrayList();
        for (Dict e : dictList) {
            if ((all != null || (all == null && BaseEntity.FLAG_NORMAL.equals(e.getStatus())))) {
                DictTreeResult dictTreeResult = new DictTreeResult();
                dictTreeResult.setId(e.getId());
                dictTreeResult.setPid(PublicUtil.isEmpty(e.getParentId()) ? "0" : e.getParentId());
                dictTreeResult.setName(e.getName());
                dictTreeResult.setValue(e.getId());
                dictTreeResult.setLabel(dictTreeResult.getName());
                mapList.add(dictTreeResult);
            }
        }
        return mapList;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findTreeData(DictTreeQuery dictTreeQuery, List<Dict> dictList) {
        String type = dictTreeQuery != null ? dictTreeQuery.getType() : null, all = dictTreeQuery != null ? dictTreeQuery.getAll() : null;
        List<Map<String, Object>> mapList = Lists.newArrayList();
        for (Dict e : dictList) {
            if ((all != null || (all == null && BaseEntity.FLAG_NORMAL.equals(e.getStatus())))) {
                Map<String, Object> map = Maps.newHashMap();
                map.put("id", e.getId());
                map.put("pId", PublicUtil.isEmpty(e.getParentId()) ? "0" : e.getParentId());
                map.put("name", e.getName());
                mapList.add(map);
            }
        }


        return mapList;
    }


    public DictResult copyBeanToResult(Dict item) {
        DictResult dictResult = new DictResult(item.getVal(), item.getName());
        return dictResult;
    }
}
