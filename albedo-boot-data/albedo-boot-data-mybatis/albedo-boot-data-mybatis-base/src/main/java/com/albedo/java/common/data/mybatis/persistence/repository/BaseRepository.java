/**
 * Copyright &copy; 2012-2016 <a href="https://github.com/thinkgem/jeesite">JeeSite</a> All rights reserved.
 */
package com.albedo.java.common.data.mybatis.persistence.repository;

import com.albedo.java.common.data.mybatis.persistence.BaseEntity;
import org.springframework.data.mybatis.repository.support.MybatisRepository;
import org.springframework.data.mybatis.repository.support.QueryDslMybatisRepository;

import java.io.Serializable;

/**
 * DAO支持类实现
 * @author ThinkGem
 * @version 2014-05-16
 */
public interface BaseRepository<T extends BaseEntity, pk extends Serializable> extends
        MybatisRepository<T, pk>{

}