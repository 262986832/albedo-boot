/**
 * Copyright &copy; 2015 <a href="http://www.bs-innotech.com/">bs-innotech</a> All rights reserved.
 */
package com.albedo.java.modules.sys.service;

import com.albedo.java.common.data.persistence.BaseEntity;
import com.albedo.java.common.data.persistence.DynamicSpecifications;
import com.albedo.java.common.data.persistence.SpecificationDetail;
import com.albedo.java.common.service.TreeService;
import com.albedo.java.modules.sys.domain.Area;
import com.albedo.java.modules.sys.domain.Org;
import com.albedo.java.modules.sys.repository.AreaRepository;
import com.albedo.java.util.PublicUtil;
import com.albedo.java.util.StringUtil;
import com.albedo.java.util.domain.QueryCondition;
import com.albedo.java.vo.sys.query.AreaTreeQuery;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 区域管理Service 区域管理
 *
 * @author admin
 * @version 2017-01-01
 */
@Service
@Transactional
public class AreaService extends TreeService<AreaRepository, Area, String> {

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findTreeData(AreaTreeQuery areaTreeQuery, List<Area> list) {

        String extId = areaTreeQuery != null ? areaTreeQuery.getExtId() : null,
                all = areaTreeQuery != null ? areaTreeQuery.getAll() : null,
                parentId = areaTreeQuery != null ? areaTreeQuery.getParentId() : null;
        Integer ltLevel = areaTreeQuery != null ? areaTreeQuery.getLtLevel() : null,
                level = areaTreeQuery != null ? areaTreeQuery.getLevel() : null;
        List<Map<String, Object>> mapList = Lists.newArrayList();
        for (int i = 0; i < list.size(); i++) {
            Area e = list.get(i);
            if ((StringUtil.isBlank(extId) || (extId != null && !extId.equals(e.getId()) && e.getParentIds().indexOf("," + extId + ",") == -1))
                    && (all != null || BaseEntity.FLAG_NORMAL.equals(e.getStatus()))
                    && (ltLevel == null || ltLevel >= e.getLevel())
                    && (level == null || level.equals(e.getLevel()))
                    && (PublicUtil.isEmpty(parentId) || e.getParentId().equals(parentId))) {
                Map<String, Object> map = Maps.newHashMap();
                map.put("id", e.getId());
                map.put("pId", e.getParentId());
                map.put("name", e.getName());
                map.put("iconCls", "fa fa-th-large");
                map.put("pIds", e.getParentIds());
                mapList.add(map);
            }
        }
        return mapList;
    }

    public List<Area> findAllList() {
        SpecificationDetail<Area> spd = DynamicSpecifications
                .bySearchQueryCondition(QueryCondition.ne(Org.F_STATUS, Org.FLAG_DELETE));
        spd.orderASC(Area.F_ID);
        return findAll(spd);
    }
}