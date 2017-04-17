/**
 * Copyright &copy; 2012-2016 <a href="https://github.com/thinkgem/jeesite">JeeSite</a> All rights reserved.
 */
package com.albedo.java.common.data.mybatis.persistence.service;

import com.albedo.java.common.data.mybatis.persistence.DynamicSpecifications;
import com.albedo.java.common.data.mybatis.persistence.GeneralEntity;
import com.albedo.java.common.data.mybatis.persistence.SpecificationDetail;
import com.albedo.java.common.data.mybatis.persistence.data.JpaCustomeRepository;
import com.albedo.java.common.data.mybatis.persistence.repository.BaseRepository;
import com.albedo.java.util.QueryUtil;
import com.albedo.java.util.base.Assert;
import com.albedo.java.util.domain.PageModel;
import com.google.common.collect.Lists;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

/**
 * Service基类
 * @author ThinkGem
 * @version 2014-05-16
 */
@Transactional
public abstract class BaseService<Repository extends BaseRepository<T, pk>, T extends GeneralEntity, pk extends Serializable> {
	public final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(getClass());
	public  Repository repository;

	@Autowired
	JpaCustomeRepository<T> jpaCustomeRepository;

	public Class<T> persistentClass;

	@SuppressWarnings("unchecked")
	public BaseService() {
		Class<?> c = getClass();
		Type type = c.getGenericSuperclass();
		if (type instanceof ParameterizedType) {
			Type[] parameterizedType = ((ParameterizedType) type).getActualTypeArguments();
			persistentClass = (Class<T>) parameterizedType[0];
		}

	}

	public T save(T entity) {
		entity = repository.save(entity);
		log.debug("Save Information for Entity: {}", entity);
		return entity;
	}

	@Transactional(readOnly=true)
	public T findOne(pk id) {
		return repository.findOne(id);
	}


	public T findBasicOne(Map<String, Object> paramsMap, String... columns) {
		return jpaCustomeRepository.findBasicOne(paramsMap, columns);
	}

	public List<T> findBasicAll(Map<String, Object> paramsMap, String... columns) {
		return jpaCustomeRepository.findBasicAll(paramsMap, columns);
	}

	public List<T> findBasicAll(Sort sort, Map<String, Object> paramsMap, String... columns) {
		return jpaCustomeRepository.findBasicAll(sort, paramsMap, columns);
	}

	public Page<T> findBasicAll(Pageable pageable, Map<String, Object> paramsMap, String... columns) {
		return jpaCustomeRepository.findBasicAll(pageable, paramsMap, columns);

	}

	public Long countBasicAll(Map<String, Object> paramsMap) {
		return jpaCustomeRepository.countBasicAll(paramsMap);
	}

	@Transactional(readOnly=true)
	public List<T> findAll(SpecificationDetail specificationDetail) {
		try {
			T entity = persistentClass.newInstance();
			String sqlConditionDsf = QueryUtil.convertQueryConditionToStr(specificationDetail.getAndQueryConditions(),
					specificationDetail.getOrQueryConditions(),
					Lists.newArrayList(DynamicSpecifications.MYBITS_SEARCH_PARAMS_MAP),
					entity.getParamsMap(), true);
			entity.setSqlConditionDsf(sqlConditionDsf);
			return repository.findBasicAll(new Sort(specificationDetail.getOrders()),entity);
		} catch (Exception e) {
			log.error(e.getMessage());
			Assert.buildException(e.getMessage());
		}
		return null;
	}
	@Transactional(readOnly=true)
	public PageModel<T> findBasePage(PageModel<T> pm, SpecificationDetail specificationDetail) {
		try {
			T entity = persistentClass.newInstance();
			String sqlConditionDsf = QueryUtil.convertQueryConditionToStr(specificationDetail.getAndQueryConditions(),
					specificationDetail.getOrQueryConditions(),
					Lists.newArrayList(DynamicSpecifications.MYBITS_SEARCH_PARAMS_MAP),
					entity.getParamsMap(), true);
			entity.setSqlConditionDsf(sqlConditionDsf);
			pm.setPageInstance(repository.findBasicAll(pm, entity));
			return pm;
		} catch (Exception e) {
			log.error(e.getMessage());
			Assert.buildException(e.getMessage());
		}
		return null;
	}

}
