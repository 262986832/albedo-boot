/**
 * Copyright &copy; 2012-2016 <a href="https://github.com/thinkgem/jeesite">JeeSite</a> All rights reserved.
 */
package com.albedo.java.common.data.mybatis.persistence;

import com.albedo.java.util.PublicUtil;
import com.albedo.java.util.config.SystemConfig;
import com.albedo.java.util.domain.PageModel;
import com.alibaba.fastjson.annotation.JSONField;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.collect.Maps;
import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.springframework.data.annotation.Transient;
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
public abstract class BaseEntity<T> extends GeneralEntity {

	private static final long serialVersionUID = 1L;

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}

	protected Integer status;

	public BaseEntity() {
		super();
		this.status = FLAG_NORMAL;
	}
	public abstract String getId();
	public abstract void setId(String id);
	/**
	 * 是否是新记录（默认：false），调用setIsNewRecord()设置新记录，使用自定义ID。
	 * 设置为true后强制执行插入语句，ID不会自动生成，需从手动传入。
	 * @return
	 */
	public boolean getIsNewRecord() {
		return isNewRecord || PublicUtil.isEmpty(getId());
	}

	/**
	 * 是否是新记录（默认：false），调用setIsNewRecord()设置新记录，使用自定义ID。
	 * 设置为true后强制执行插入语句，ID不会自动生成，需从手动传入。
	 */
	public void setIsNewRecord(boolean isNewRecord) {
		this.isNewRecord = isNewRecord;
	}
	/**
	 * 插入之前执行方法，子类实现
	 */
	public abstract void preInsert();

	/**
	 * 更新之前执行方法，子类实现
	 */
	public abstract void preUpdate();

}
