/**
 * Copyright &copy; 2012-2016 <a href="https://github.com/thinkgem/jeesite">JeeSite</a> All rights reserved.
 */
package com.albedo.java.common.data.mybatis.persistence;

import com.albedo.java.util.PublicUtil;
import com.albedo.java.util.annotation.DictType;
import com.albedo.java.util.annotation.SearchField;
import com.albedo.java.util.config.SystemConfig;
import com.albedo.java.util.domain.PageModel;
import com.alibaba.fastjson.annotation.JSONField;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.collect.Maps;
import io.swagger.annotations.ApiModelProperty;
import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mybatis.annotations.Column;
import org.springframework.data.mybatis.annotations.MappedSuperclass;

import javax.xml.bind.annotation.XmlTransient;
import java.io.Serializable;
import java.util.Map;

/**
 * Entity支持类
 * @author ThinkGem
 * @version 2014-05-16
 */
@MappedSuperclass
public abstract class BaseEntity<ID extends Serializable> extends GeneralEntity<ID> {

	private static final long serialVersionUID = 1L;

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}
	@Column(name = "status_")
	@SearchField
	@DictType(name="sys_status")@ApiModelProperty(hidden=true)
	protected Integer status;

	public BaseEntity() {
		super();
		this.status = FLAG_NORMAL;
	}

}
